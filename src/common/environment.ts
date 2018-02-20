const environment = {
  isBrowser: (): boolean => {
    return (
      typeof window !== "undefined" && typeof XMLHttpRequest === "function"
    );
  },
  isNode: (): boolean => {
    return typeof module !== "undefined" && !!module.exports;
  },
};

export { environment };
