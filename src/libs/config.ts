export default {
  get: (key: string) => process.env[key] || "",
};
