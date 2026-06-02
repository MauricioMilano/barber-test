# ============================================
# Exemplo de uso do Docker
# ============================================
#
# Build da imagem:
#   docker build -t comanda-digital .
#
# Ou com docker-compose:
#   docker-compose up -d
#
# -------------------------------------------
# Variáveis de ambiente necessárias:
# -------------------------------------------
#
# FRONTEND (build-time, passado como ARG):
#   VITE_API_URL=http://seu-dominio.com  # URL da API para o frontend acessar
#
# BACKEND (runtime, passadas como ENV):
#   PORT=3001                              # Porta do servidor (padrão: 3001)
#   JWT_SECRET=sua-chave-secreta-aqui      # Chave para assinar tokens JWT
#   DATABASE_URL=file:./prisma/dev.db      # Connection string do banco SQLite
#   BASE_URL=http://localhost              # URL base (usado p/ links no WhatsApp)
#
# Exemplo com docker run:
#   docker run -d \
#     --name comanda-digital \
#     -p 80:80 \
#     -e PORT=3001 \
#     -e JWT_SECRET=minha-chave-super-secreta \
#     -e DATABASE_URL=file:./prisma/dev.db \
#     -e BASE_URL=http://meu-servidor.com \
#     comanda-digital
#
# -------------------------------------------
# Para desenvolvimento local com SQLite:
# -------------------------------------------
# Crie um arquivo .env na pasta server/ com:
#   DATABASE_URL="file:./prisma/dev.db"
#   JWT_SECRET="sua-chave-secreta"
#
# O banco SQLite será criado automaticamente na primeira execução.