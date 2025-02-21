const { Rcon } = require('rcon-client');
const colors = require('colors');
const Table = require('cli-table3');

const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), "config.json");

const config = (() => {
    try {
        return JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (err) {
        console.error(`No se pudo cargar el archivo de configuración en ${configPath}.`, err);
    }
})();

// Función para obtener un timestamp formateado con la hora local del sistema
function getTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return `${date} ${hours}:${minutes}:${seconds}`;
}

// Función para imprimir la marca de agua y la información adicional
function imprimirInfo() {
    const info = `
    =====================================================
${'   _____          __        __________                     '.green}
${'  /  _  \\  __ ___/  |_  ____\\______   \\ ____  ____   ____  '.green}
${' /  /_\\  \\|  |  \\   __\\/  _ \\|       _// ___\\/  _ \\ /    \\ '.green}
${'/    |    \\  |  /|  | (  <_> )    |   \\  \\__(  <_> )   |  \\'.green}
${'\\____|__  /____/ |__|  \\____/|____|_  /\\___  >____/|___|  /'.green}
${'        \\/                          \\/     \\/           \\/ '.green}
                                                by Prahzera
    =====================================================
    `;
    console.log(info);
    imprimirResumenConfig();
}

function imprimirResumenConfig() {
    // Imprimir resumen de comandos
    const tableComandos = new Table({
        head: ['Comando', 'Tiempo', 'Valor'],
        colWidths: [30, 10, 10],
        style: { head: ['cyan'], border: ['gray'], compact: true },
    });

    config.comandos.forEach((comando) => {
        tableComandos.push([comando.comando, comando.tiempo, comando.valor]);
    });

    console.log('Comandos cargados:\n' + tableComandos.toString());

    // Imprimir resumen de servidores (incluyendo puerto)
    const tableServidores = new Table({
        head: ['#', 'IP', 'Puerto'],
        colWidths: [5, 20, 10],
        style: { head: ['cyan'], border: ['gray'], compact: true },
    });

    config.servidores.forEach((servidor, index) => {
        tableServidores.push([index + 1, servidor.ip, servidor.puerto]);
    });

    console.log('\nServidores cargados:\n' + tableServidores.toString());
}

function crearCaja(respuesta) {
    const line = `+${'-'.repeat(50)}+`;
    const paddedRespuesta = respuesta.split('\n').map(line => `| ${line.padEnd(48)} |`).join('\n');
    return `${line}\n${paddedRespuesta}\n${line}`;
}

async function ejecutarComando(servidor, comando) {
    const { ip, puerto, password } = servidor;

    const rcon = new Rcon({
        host: ip,
        port: puerto,
        password: password,
    });

    try {
        console.log(`[${getTimestamp().grey}] ${'Conectando'.cyan} a ${ip}:${puerto}...`);
        await rcon.connect();
        console.log(`[${getTimestamp().grey}] ${'Enviando comando'.yellow}: ${comando.comando}`);

        const respuesta = await rcon.send(comando.comando);
        const cajaRespuesta = crearCaja(respuesta);
        console.log(`[${getTimestamp().grey}] ${'Respuesta'.green} de ${ip}:${puerto}:\n${cajaRespuesta}`);

    } catch (error) {
        console.error(`[${getTimestamp().grey}] ${'Error'.red} en ${ip}:${puerto}:`, error.message);
    } finally {
        rcon.end();
        console.log(`[${getTimestamp().grey}] ${'Desconectado'.magenta} de ${ip}:${puerto}`);
    }
}

// Convertir tiempo a milisegundos
function tiempoAMilisegundos(tiempo, valor) {
    switch (tiempo) {
        case 'h': return valor * 60 * 60 * 1000;  // Horas a milisegundos
        case 'm': return valor * 60 * 1000;       // Minutos a milisegundos
        case 's': return valor * 1000;            // Segundos a milisegundos
        default: throw new Error('Unidad de tiempo no soportada');
    }
}


// Inicializar intervalos para comandos
function iniciarComandos() {
    // Ejecutar comandos al inicio
    config.comandos.forEach((comando) => {
        config.servidores.forEach((servidor) => {
            ejecutarComando(servidor, comando);
        });
    });

    // Luego, ejecutar cada comando en intervalos configurados
    config.comandos.forEach((comando) => {
        const intervalo = tiempoAMilisegundos(comando.tiempo, comando.valor);
        setInterval(() => {
            config.servidores.forEach((servidor) => {
                ejecutarComando(servidor, comando);
            });
        }, intervalo);
    });
}

// Iniciar la ejecución
imprimirInfo();  // Imprimir la marca de agua e información adicional
iniciarComandos();  // Ejecutar comandos inmediatamente y luego en intervalos
