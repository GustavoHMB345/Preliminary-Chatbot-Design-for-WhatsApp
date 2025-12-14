// 1. Carrega as variáveis de ambiente (Segurança)
require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const chalk = require('chalk');
const ora = require('ora');

// --- 🔧 DEFINIÇÕES GERAIS ---
// Instrução do sistema (Personalidade do Bot)
const SYSTEM_INSTRUCTION = "Você é a Clara, assistente virtual da clínica OdontoVida. Você deve ser simpática, profissional e objetiva. Responda dúvidas sobre agendamentos e tratamentos básicos. Use emojis moderadamente."; 

console.clear();
console.log(chalk.bold.cyan('🚀 INICIANDO MVP - PROTOCOLO ODONTOVIDA...'));

// Verifica se a chave do Gemini existe
if (!process.env.GEMINI_API_KEY) {
    console.error(chalk.bgRed.white.bold(' ERRO CRÍTICO ') + chalk.red(' A chave GEMINI_API_KEY não foi encontrada no arquivo .env'));
    process.exit(1);
}

// Verifica se o arquivo do Firebase existe
const firebasePath = process.env.FIREBASE_PATH || './firebase-key.json';
let serviceAccount;
try {
    serviceAccount = require(firebasePath);
} catch (error) {
    console.error(chalk.bgRed.white.bold(' ERRO CRÍTICO ') + chalk.red(` O arquivo ${firebasePath} não foi encontrado na pasta.`));
    console.log(chalk.yellow('Dica: Baixe a chave do Firebase, coloque nesta pasta e renomeie para firebase-key.json'));
    process.exit(1);
}

// --- 🔌 CONEXÕES ---
const spinner = ora('Conectando aos serviços...').start();

// 1. Conecta Firebase
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
spinner.text = 'Firebase Conectado... Conectando IA...';

// 2. Conecta Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- CORREÇÃO AQUI: Mudança para o modelo mais atual (Flash) ---
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", // Modelo mais rápido e atualizado
    systemInstruction: SYSTEM_INSTRUCTION // Nova forma de passar a instrução
});

spinner.succeed(chalk.green('Sistemas Conectados! (Firebase + Gemini 1.5 Flash)'));

// --- 🤖 INICIALIZAÇÃO DO CLIENTE WHATSAPP ---
const client = new Client({
    authStrategy: new LocalAuth()
});

// --- EVENTOS DO CLIENTE ---

client.on('qr', (qr) => {
    console.log(chalk.yellow('\n⚠️  Escaneie o QR Code abaixo para entrar:'));
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log(chalk.bgGreen.black.bold(' ✅ TUDO PRONTO! O BOT ESTÁ ONLINE '));
    console.log(chalk.gray('Mande uma mensagem para o seu número para testar...'));
});

// Evento de mensagem
client.on('message', async (message) => {
    if (message.from.includes('@g.us') || message.from.includes('status')) return;
    
    console.log(chalk.blue(`\n👤 Cliente (${message.from.slice(0,4)}...): ${message.body}`));
    const think = ora('IA Pensando...').start();

    try {
        await salvarLog(message.from, message.body, 'user');
        const historico = await obterContexto(message.from);
        
        // Inicia o chat com o histórico
        const chat = model.startChat({
            history: historico
        });

        const result = await chat.sendMessage(message.body);
        const resposta = result.response.text();

        await client.sendMessage(message.from, resposta);
        await salvarLog(message.from, resposta, 'bot');
        
        think.succeed(chalk.green('Respondido!'));
        console.log(chalk.magenta(`🤖 Bot Clara: ${resposta}`));

    } catch (error) {
        think.fail(chalk.red('Erro ao processar'));
        console.error(chalk.red('Detalhe do erro:'), error.message || error);
    }
});

// --- FUNÇÕES AUXILIARES ---

async function obterContexto(userId) {
    const historicoRef = db.collection('usuarios').doc(userId).collection('historico');
    const snapshot = await historicoRef.orderBy('data', 'desc').limit(10).get();
    const historico = [];
    snapshot.forEach(doc => {
        const dados = doc.data();
        historico.push({ role: dados.role, parts: [{ text: dados.mensagem }] });
    });
    return historico.reverse();
}

async function salvarLog(userId, mensagem, role) {
    const historicoRef = db.collection('usuarios').doc(userId).collection('historico');
    const roleGemini = role === 'bot' ? 'model' : 'user';
    
    await historicoRef.add({
        role: roleGemini,
        mensagem: mensagem,
        data: new Date()
    });
}

// Inicializa o cliente
client.initialize();