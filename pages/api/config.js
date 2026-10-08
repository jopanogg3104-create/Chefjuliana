export default function handler(req, res) {
  res.status(410).json({ error: "Esta rota foi descontinuada." });
}
