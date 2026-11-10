export function validarEmail(email: string): boolean {
  const normalizado = email.trim().toLowerCase();

  return (
    normalizado.length <= 100 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado)
  );
}
