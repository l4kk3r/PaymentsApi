export default (size: number = 16) => [...Array(size)].map(() => Math.floor(Math.random() * 36).toString(36)).join('');