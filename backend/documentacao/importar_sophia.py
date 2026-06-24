import os
import json
import base64
import urllib.request
import urllib.error

# ============================================================
#  CONFIGURACOES
# ============================================================

URL_BASE          = "https://portal.sophia.com.br/SophiAWebAPI"
TENANT            = "10059"
USUARIO           = "Importador"
SENHA             = "3bWd+QZ5G,4K"
PASTA_ORGANIZADOS = r"C:\Alunos\teste_sophia"
ARQUIVO_LOG       = r"C:\Alunos\log_sophia.txt"

# ============================================================
#  1. Autenticacao
# ============================================================

def autenticar():
    print("Autenticando na API do Sophia...")
    url = "{}/{}/api/v1/Autenticacao".format(URL_BASE, TENANT)
    body = json.dumps({"usuario": USUARIO, "senha": SENHA}).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("accept", "text/plain")
    try:
        with urllib.request.urlopen(req) as resp:
            token = resp.read().decode("utf-8").strip().strip('"')
            print("  Autenticado com sucesso!")
            return token
    except urllib.error.HTTPError as e:
        print("  ERRO ao autenticar: {}".format(e))
        input("\nPressione Enter para sair.")
        exit()

# ============================================================
#  2. Envia documento
# ============================================================

def enviar_documento(token, id_aluno, descricao, extensao, conteudo_base64):
    url = "{}/{}/api/v1/clientes/{}/Documentos".format(URL_BASE, TENANT, id_aluno)
    body = json.dumps({
        "descricao": descricao,
        "url": conteudo_base64,
        "extensao": extensao
    }).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("accept", "text/plain")
    req.add_header("token", token)
    try:
        with urllib.request.urlopen(req) as resp:
            return True, resp.getcode()
    except urllib.error.HTTPError as e:
        return False, e.code

# ============================================================
#  3. Processa pastas e arquivos
# ============================================================

def processar():
    token = autenticar()

    enviados = 0
    erros = []

    pastas = [p for p in os.listdir(PASTA_ORGANIZADOS)
              if os.path.isdir(os.path.join(PASTA_ORGANIZADOS, p))]

    total_pastas = len(pastas)
    print("  {} pastas de alunos encontradas.\n".format(total_pastas))

    for i, nome_pasta in enumerate(pastas, 1):
        partes = nome_pasta.split(" - ", 1)
        if len(partes) < 2:
            erros.append("[PASTA SEM PADRAO] {}".format(nome_pasta))
            continue

        id_aluno = partes[0].strip()
        nome_aluno = partes[1].strip()
        caminho_pasta = os.path.join(PASTA_ORGANIZADOS, nome_pasta)

        arquivos = [f for f in os.listdir(caminho_pasta)
                    if os.path.isfile(os.path.join(caminho_pasta, f))]

        if not arquivos:
            continue

        print("[{}/{}] {} - {} arquivo(s)".format(i, total_pastas, nome_pasta, len(arquivos)))

        for nome_arquivo in arquivos:
            caminho_arquivo = os.path.join(caminho_pasta, nome_arquivo)

            # Extensao
            _, ext = os.path.splitext(nome_arquivo)
            extensao = ext.lstrip(".").lower()

            # Descricao
            try:
                parte_nome = nome_arquivo.split(";")[-1]
                descricao = parte_nome.split("_", 1)[1]
                descricao = os.path.splitext(descricao)[0].strip()
            except Exception:
                descricao = os.path.splitext(nome_arquivo)[0]

            # Converte para base64
            try:
                with open(caminho_arquivo, "rb") as f:
                    conteudo_base64 = base64.b64encode(f.read()).decode("utf-8")
            except Exception as e:
                erros.append("[ERRO LEITURA] {} | {}".format(nome_arquivo, e))
                continue

            # Envia
            sucesso, codigo = enviar_documento(token, id_aluno, descricao, extensao, conteudo_base64)

            if sucesso:
                enviados += 1
                print("  OK: {}".format(nome_arquivo))
            else:
                erros.append("[ERRO HTTP {}] RA:{} | {}".format(codigo, id_aluno, nome_arquivo))
                print("  ERRO {}: {}".format(codigo, nome_arquivo))

    # ============================================================
    #  4. Log
    # ============================================================

    with open(ARQUIVO_LOG, "w", encoding="utf-8") as f:
        f.write("=== RELATORIO IMPORTACAO SOPHIA ===\n")
        f.write("Documentos enviados com sucesso: {}\n".format(enviados))
        f.write("Documentos com erro:             {}\n\n".format(len(erros)))
        if erros:
            f.write("--- Erros ---\n")
            for linha in erros:
                f.write(linha + "\n")

    print("\n=============================")
    print("  Concluido!")
    print("  Enviados com sucesso: {}".format(enviados))
    print("  Com erro:             {}".format(len(erros)))
    print("  Log salvo em: {}".format(ARQUIVO_LOG))
    print("=============================")
    input("\nPressione Enter para fechar.")

# ============================================================
#  Executa
# ============================================================

processar()
