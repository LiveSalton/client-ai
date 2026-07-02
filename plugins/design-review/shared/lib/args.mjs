export function parseArgs(argv = process.argv.slice(2)) {
  const args = {};
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item.startsWith('--')) {
      const [rawKey, inlineValue] = item.slice(2).split('=', 2);
      const key = rawKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (inlineValue !== undefined) {
        args[key] = inlineValue;
      } else if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
        args[key] = argv[i + 1];
        i += 1;
      } else {
        args[key] = true;
      }
    } else {
      rest.push(item);
    }
  }
  args._ = rest;
  return args;
}
