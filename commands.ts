const DurationRegex = /^\d+:\d{2}(\.\d{1,3})?$/;
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
  const [minutes, seconds] = time.split(":").map((x) => parseFloat(x));
  return minutes * 60 + seconds;
}

function ParseInteger(time: string) {
  if (!IntRegex.test(time)) return null;
  return parseInt(time);
}

function BuildAnswer(fuel: number, suffix: string = "") {
  return `I calculated: ${fuel.toFixed(2)}L${suffix ? ` | ${suffix}` : ""}`;
}

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
      if (extraLap === null) throw new Error("Ungültige extra Lap");
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
    return BuildAnswer(fuel, `${laps.toFixed(2)} Laps`);
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
      if (extraLap === null) throw new Error("Ungültige extra Lap");
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
    return `
    Calculate fuel usage for either a stint by length in minutes or by amount of laps
    
    > Syntax for stint: \`!fuel stint <stint in minutes> <lap time> <fuel per lap> <optional, extra laps>\`
    > Example stint: \`!fuel 45 1:48 3.2\`
    > Example stint with extra: \`!fuel 45 1:48 3.2 1\`
    
    > Syntax for laps: \`!fuel laps <amount of laps> <fuel per lap> <optional, extra laps>\`
    > Example laps: \`!fuel 45 3.2\`
    > Example laps with extra: \`!fuel 45 3.2 1\`
    
    Running this bot costs a few € monthly. I'd highly appreciate any donation: https://paypal.me/alexanderjanke92/1`;
  }
);

const commands = [stint, laps, help];
export { commands, help };
