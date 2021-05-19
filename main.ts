import * as Discord from "discord.js";
const client = new Discord.Client();

const DurationRegex = /^\d+:\d{2}$/;
const IntRegex = /^\d+$/;

class Command<T> {
  prefix: string;
  args: (msg: string, prefix: string) => T;
  answerText: (args: T) => string;

  constructor(
    prefix: string,
    args: (msg: string, prefix: string) => T,
    answerText: (args: T) => string
  ) {
    this.prefix = prefix;
    this.args = args;
    this.answerText = answerText;
  }

  reply(text: string): string {
    const s = this.args(text, this.prefix);
    return this.answerText(s);
  }
}

function ParseDuration(time: string) {
  if (!DurationRegex.test(time)) return null;
  const [minutes, seconds] = time.split(":").map((x) => parseInt(x));
  return minutes * 60 + seconds;
}

function ParseInteger(time: string) {
  if (!IntRegex.test(time)) return null;
  return parseInt(time);
}

function BuildAnswer(fuel: number) {
  return `Mate, du brauchst ${fuel.toFixed(2)}L.`;
}

client.on("ready", () => {
  console.log(`Bot running...`);

  const stint = new Command(
    "!fuel stint",
    (msg, prefix) => {
      const args = msg.replace(prefix, "").trim().split(" ");
      if (args.length < 3 || args.length > 4)
        throw new Error("Ungültige Anzahl an Parametern");

      const duration = ParseInteger(args[0]);
      if (!duration) throw new Error("Ungültige Stintlänge");

      const lapTime = ParseDuration(args[1]);
      if (!lapTime) throw new Error("Ungültige Laptime");

      const fuelPerLap = parseFloat(args[2]);
      if (!fuelPerLap) throw new Error("Ungültiger Sprit");

      let extraLap = 0;
      if (args.length == 4) {
        extraLap = ParseInteger(args[3])!;
        if (!extraLap) throw new Error("Ungültige extra Lap");
      }

      return {
        duration: duration * 60,
        lapTime,
        fuelPerLap,
        extraLap,
      };
    },
    (args) => {
      const laps = args.duration / args.lapTime;
      const fuel = (laps + args.extraLap) * args.fuelPerLap;
      return BuildAnswer(fuel);
    }
  );

  const laps = new Command(
    "!fuel laps",
    (msg, prefix) => {
      const args = msg.replace(prefix, "").trim().split(" ");
      if (args.length < 2 || args.length > 3)
        throw new Error("Ungültige Anzahl an Parametern");

      const laps = ParseInteger(args[0]);
      if (!laps) throw new Error("Ungültige Laps");

      const fuelPerLap = parseFloat(args[1]);
      if (!fuelPerLap) throw new Error("Ungültiger Sprit");

      let extraLap = 0;
      if (args.length == 3) {
        extraLap = ParseInteger(args[2])!;
        if (!extraLap) throw new Error("Ungültige extra Lap");
      }

      return {
        laps,
        fuelPerLap,
        extraLap,
      };
    },
    (args) => {
      const fuel = (args.laps + args.extraLap) * args.fuelPerLap;
      return BuildAnswer(fuel);
    }
  );

  const help = new Command(
    "!fuel help",
    () => {},
    () => {
      return "Use this bot like this... ";
    }
  );

  const msg = "!fuel laps 21 3.4";
  console.log(help.reply(msg));
});

// client.on('message', msg => {
//   if (msg.content === '') {
//     msg.reply('pong');
//   }
// });

client.login("ODQ0NTQzNzYzMzMwMjM2NDY3.YKT8rA.3EZFsJ4L4vGGsFn0A9ZGrHi_Qww");
