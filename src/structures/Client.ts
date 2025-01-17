import { Client, ClientEvents, Collection, Intents } from "discord.js";
import { CommandType } from "../types/commandType";
import fs from "fs"
import { Event } from "./Event";
import dotenv from "dotenv"

dotenv.config()

if (process.env.enviroment === "dev") {
    console.log("DEV")
    var botToken: string = process.env.DEV_BOT_TOKEN
  } else {
    var botToken: string = process.env.BOT_TOKEN
  }

const myIntents = new Intents()
myIntents.add(
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
)

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection()

    constructor() {
        super({ intents: myIntents })
    }

    start() {
        this.registerModules()
        this.login(botToken)
    }

    async registerModules() {
        //Commands
        const commandFiles = []
        commandFiles.push.apply(commandFiles, fs.readdirSync(`${__dirname}/../commands`).filter(file => file.endsWith('.ts')))
        commandFiles.push.apply(commandFiles, fs.readdirSync(`${__dirname}/../commands`).filter(file => file.endsWith('.js')))

        for (const file of commandFiles) {
            const command: CommandType = (await import(`../commands/${file}`)).default
            this.commands.set(command.name, command)
        }

        //Events
        const eventFiles = []
        eventFiles.push.apply(eventFiles, fs.readdirSync(`${__dirname}/../events`).filter(file => file.endsWith('.ts')))
        eventFiles.push.apply(eventFiles, fs.readdirSync(`${__dirname}/../events`).filter(file => file.endsWith('.js')))

        for (const file of eventFiles) {
            const event: Event<keyof ClientEvents> = (await import(`../events/${file}`)).default
            this.on(event.event, event.execute)
        }
    }
}