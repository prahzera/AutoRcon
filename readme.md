# AutoRcon

Este es un programa CLI en Node.js para automatizar comandos RCON en cualquier juego que utilice este protocolo. Permite ejecutar comandos en servidores configurados y enviarlos en intervalos personalizados.

## Características
- Conexión a múltiples servidores RCON.
- Envío automático de comandos en intervalos configurables.
- Interfaz CLI con tablas formateadas.
- Empaquetable en un solo archivo `.exe`.

## Requisitos
- Node.js (>= 14)
- Un archivo `config.json` con la configuración de servidores y comandos.

## Instalación

Clona este repositorio y ejecuta la instalación de dependencias:

```sh
npm install
```

## Configuración

El programa requiere un archivo `config.json` en la raíz del proyecto con la siguiente estructura:

```json
{
  "servidores": [
    { "ip": "127.0.0.1", "puerto": 25575, "password": "tu_contraseña" }
  ],
  "comandos": [
    { "comando": "say Hola", "tiempo": "m", "valor": 5 }
  ]
}
```

- `servidores`: Lista de servidores RCON con IP, puerto y contraseña.
- `comandos`: Lista de comandos a ejecutar con su intervalo de tiempo.
  - `tiempo`: `h` (horas), `m` (minutos) o `s` (segundos).
  - `valor`: Cantidad de la unidad de tiempo.

## Uso

Para ejecutar el programa:

```sh
node index.js
```

### Empaquetar como .exe

Para generar un ejecutable independiente:

```sh
npm run build
```

Esto generará un archivo `.exe` que podrá ejecutarse sin necesidad de Node.js. El `.exe` leerá el `config.json` dinámicamente.

## Dependencias

- `rcon-client`: Para conectar con servidores RCON.
- `colors`: Para mejorar la visualización en consola.
- `cli-table3`: Para mostrar información en tablas.

## Licencia

MIT License.

