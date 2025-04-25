export default function devlog(...args: any[]) {
  let isdev = import.meta.env.MODE === "development"
  if (isdev) {
    console.log(...args)
  }
}
