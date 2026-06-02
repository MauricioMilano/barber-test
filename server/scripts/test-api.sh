#!/bin/bash

# API Test Script for Comanda Digital Barbearia
# This script tests the main API endpoints

BASE_URL="http://localhost:3001/api"
TOKEN=""

echo "========================================="
echo "🧪 Comanda Digital API Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print test results
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $2"
  else
    echo -e "${RED}❌ FAIL${NC}: $2"
    if [ -n "$3" ]; then
      echo "       Response: $3"
    fi
  fi
}

# Helper function to make JSON pretty
pretty_json() {
  echo "$1" | python3 -m json.tool 2>/dev/null || echo "$1"
}

# ============================================
# 1. Health Check
# ============================================
echo "📡 Testing Health Check..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | grep -q "status"; then
  print_result 0 "Health check"
  echo "       Response: $(echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH")"
else
  print_result 1 "Health check" "$HEALTH"
fi
echo ""

# ============================================
# 2. Authentication - Login as Admin
# ============================================
echo "🔐 Testing Authentication..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@barbearia.com","password":"admin123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null)

if [ -n "$TOKEN" ]; then
  print_result 0 "Admin login"
  echo "       Token obtained successfully"
else
  print_result 1 "Admin login" "$LOGIN_RESPONSE"
  echo -e "${YELLOW}⚠️  Skipping authenticated tests${NC}"
  exit 1
fi
echo ""

# ============================================
# 3. Get Current User (/auth/me)
# ============================================
echo "👤 Testing Get Current User..."
ME_RESPONSE=$(curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q "user"; then
  print_result 0 "Get current user"
  echo "       User: $(echo "$ME_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); u=d.get('user',{}); print(f\"{u.get('name')} ({u.get('email')})\")" 2>/dev/null)"
else
  print_result 1 "Get current user" "$ME_RESPONSE"
fi
echo ""

# ============================================
# 4. Services CRUD
# ============================================
echo "✂️ Testing Services..."
SERVICES_RESPONSE=$(curl -s "$BASE_URL/admin/services" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SERVICES_RESPONSE" | grep -q "services"; then
  print_result 0 "List services"
  SERVICE_COUNT=$(echo "$SERVICES_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('services',[])))" 2>/dev/null)
  echo "       Found $SERVICE_COUNT services"
else
  print_result 1 "List services" "$SERVICES_RESPONSE"
fi
echo ""

# ============================================
# 5. Products CRUD
# ============================================
echo "🛒 Testing Products..."
PRODUCTS_RESPONSE=$(curl -s "$BASE_URL/admin/products" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PRODUCTS_RESPONSE" | grep -q "products"; then
  print_result 0 "List products"
  PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('products',[])))" 2>/dev/null)
  echo "       Found $PRODUCT_COUNT products"
else
  print_result 1 "List products" "$PRODUCTS_RESPONSE"
fi
echo ""

# ============================================
# 6. Categories CRUD
# ============================================
echo "📂 Testing Categories..."
CATEGORIES_RESPONSE=$(curl -s "$BASE_URL/admin/categories" \
  -H "Authorization: Bearer $TOKEN")

if echo "$CATEGORIES_RESPONSE" | grep -q "categories"; then
  print_result 0 "List categories"
  CAT_COUNT=$(echo "$CATEGORIES_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('categories',[])))" 2>/dev/null)
  echo "       Found $CAT_COUNT categories"
else
  print_result 1 "List categories" "$CATEGORIES_RESPONSE"
fi
echo ""

# ============================================
# 7. Barbers CRUD
# ============================================
echo "🪒 Testing Barbers..."
BARBERS_RESPONSE=$(curl -s "$BASE_URL/admin/barbeiros" \
  -H "Authorization: Bearer $TOKEN")

if echo "$BARBERS_RESPONSE" | grep -q "barbers"; then
  print_result 0 "List barbers"
  BARBER_COUNT=$(echo "$BARBERS_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('barbers',[])))" 2>/dev/null)
  echo "       Found $BARBER_COUNT barbers"
else
  print_result 1 "List barbers" "$BARBERS_RESPONSE"
fi
echo ""

# ============================================
# 8. Clients CRUD
# ============================================
echo "👥 Testing Clients..."
CLIENTS_RESPONSE=$(curl -s "$BASE_URL/admin/clientes" \
  -H "Authorization: Bearer $TOKEN")

if echo "$CLIENTS_RESPONSE" | grep -q "clients"; then
  print_result 0 "List clients"
  CLIENT_COUNT=$(echo "$CLIENTS_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('clients',[])))" 2>/dev/null)
  echo "       Found $CLIENT_COUNT clients"
else
  print_result 1 "List clients" "$CLIENTS_RESPONSE"
fi
echo ""

# ============================================
# 9. Dashboard Stats
# ============================================
echo "📊 Testing Dashboard..."
DASH_RESPONSE=$(curl -s "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DASH_RESPONSE" | grep -q "todayAppointments"; then
  print_result 0 "Dashboard stats"
  echo "       Response: $(echo "$DASH_RESPONSE" | python3 -m json.tool 2>/dev/null | head -20)..."
else
  print_result 1 "Dashboard stats" "$DASH_RESPONSE"
fi
echo ""

# ============================================
# 10. Appointments
# ============================================
echo "📅 Testing Appointments..."
APPT_RESPONSE=$(curl -s "$BASE_URL/admin/agendamentos" \
  -H "Authorization: Bearer $TOKEN")

if echo "$APPT_RESPONSE" | grep -q "appointments"; then
  print_result 0 "List appointments"
  APPT_COUNT=$(echo "$APPT_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('appointments',[])))" 2>/dev/null)
  echo "       Found $APPT_COUNT appointments"
else
  print_result 1 "List appointments" "$APPT_RESPONSE"
fi
echo ""

# ============================================
# 11. Cortesias (Courtesy Rules)
# ============================================
echo "🎁 Testing Cortesias..."
CORTESIAS_RESPONSE=$(curl -s "$BASE_URL/admin/cortesias" \
  -H "Authorization: Bearer $TOKEN")

if echo "$CORTESIAS_RESPONSE" | grep -q "rules"; then
  print_result 0 "List cortesia rules"
else
  print_result 1 "List cortesia rules" "$CORTESIAS_RESPONSE"
fi
echo ""

# ============================================
# 12. Totem - Cliente Creation
# ============================================
echo "🏪 Testing Totem - Client Creation..."
TOTEM_CLIENT_RESPONSE=$(curl -s -X POST "$BASE_URL/totem/cliente" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste CLI","cpf":"99999999999","phone":"11999999999","email":"teste@cli.com"}')

if echo "$TOTEM_CLIENT_RESPONSE" | grep -q "client"; then
  print_result 0 "Create client via totem"
  CLIENT_ID=$(echo "$TOTEM_CLIENT_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); c=d.get('client',{}); print(c.get('id',''))" 2>/dev/null)
  echo "       Client ID: $CLIENT_ID"
else
  print_result 1 "Create client via totem" "$TOTEM_CLIENT_RESPONSE"
fi
echo ""

# ============================================
# Summary
# ============================================
echo "========================================="
echo "✅ API Test Suite Completed"
echo "========================================="