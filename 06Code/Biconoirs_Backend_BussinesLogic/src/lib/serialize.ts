// Ensure BigInt can be serialized to JSON globally
if (!BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}

export function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}
