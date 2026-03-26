import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Upload } from "lucide-react";
import { api, ApiError, API_BASE } from "@/lib/api";
import { getAuthUser, getAuthToken, setAuthSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type DocKey =
  | "cpf"
  | "rg"
  | "cnh"
  | "home_doc"
  | "identifier";

const documentConfig: Array<{
  key: DocKey;
  label: string;
  urlField: string;
  pathField: string;
}> = [
    { key: "cpf", label: "CPF", urlField: "cpf_file_url", pathField: "cpf_file_path" },
    { key: "rg", label: "RG", urlField: "rg_file_url", pathField: "rg_file_path" },
    { key: "cnh", label: "CNH", urlField: "cnh_file_url", pathField: "cnh_file_path" },
    { key: "home_doc", label: "Comprovante de residência", urlField: "home_doc_file_url", pathField: "home_doc_file_path" },
    { key: "identifier", label: "Documento complementar", urlField: "identifier_file_url", pathField: "identifier_file_path" },
  ];

const DriverDocuments = () => {
  const authUser = getAuthUser();
  const token = getAuthToken();
  const navigate = useNavigate();

  const [driver, setDriver] = useState<any>(authUser || {});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [bootLoading, setBootLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadDriver = async () => {
    if (!authUser?.id) return;

    try {
      setBootLoading(true);
      setError(null);

      const response = await api.get<{ data: any[] }>("/driver", { limit: 200 });
      const current = (response.data || []).find((item) => item.id === authUser.id);

      if (current) {
        setDriver(current);

        if (token) {
          setAuthSession(token, {
            ...authUser,
            ...current,
          } as any);
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar documentos");
    } finally {
      setBootLoading(false);
    }
  };

  useEffect(() => {
    loadDriver();
  }, [authUser?.id]);

  const uploadDocumentToBackend = async (docType: DocKey, file: File) => {
    if (!authUser?.id) {
      throw new Error("Motorista não identificado");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_BASE}/driver/${authUser.id}/document/${docType}`,
      {
        method: "POST",
        headers: token
          ? {
            Authorization: `Bearer ${token}`,
          }
          : undefined,
        body: formData,
      }
    );

    const text = await response.text();
    let payload: any = null;

    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (!response.ok) {
      throw new Error(payload?.message || "Erro ao enviar documento");
    }

    return payload;
  };

  const uploadDocument = async (item: typeof documentConfig[number]) => {
    if (!authUser?.id) return;

    const file = files[item.key];
    if (!file) {
      setError(`Selecione um arquivo para ${item.label}`);
      return;
    }

    try {
      setLoadingKey(item.key);
      setError(null);
      setMessage(null);

      await uploadDocumentToBackend(item.key, file);

      setMessage(`${item.label} enviado com sucesso`);
      setFiles((current) => ({ ...current, [item.key]: null }));
      await loadDriver();
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : err?.message || `Erro ao enviar ${item.label}`);
    } finally {
      setLoadingKey(item.key);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div>
        <div className="flex items-center gap-4 mb-1">
          <button onClick={() => navigate("/driver")} className="text-foreground">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Meus Documentos</h1>
        </div>

        <p className="text-muted-foreground">Envio e visualização dos documentos do motorista</p>
      </div>

      {bootLoading ? <div className="glass-card p-4 text-sm text-muted-foreground">Carregando documentos...</div> : null}
      {error ? <div className="glass-card p-4 text-sm text-destructive">{error}</div> : null}
      {message ? <div className="glass-card p-4 text-sm text-green-600">{message}</div> : null}

      <div className="grid md:grid-cols-2 gap-6">
        {documentConfig.map((item) => {
          const url = driver?.[item.urlField];

          return (
            <div key={item.key} className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{item.label}</h2>
              </div>

              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Abrir documento atual
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum documento enviado</p>
              )}

              <label className="h-12 px-4 rounded-md border border-border bg-secondary flex items-center gap-3 cursor-pointer">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {files[item.key]?.name || "Selecionar arquivo"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setFiles((current) => ({
                      ...current,
                      [item.key]: e.target.files?.[0] || null,
                    }))
                  }
                />
              </label>

              <Button
                onClick={() => uploadDocument(item)}
                disabled={loadingKey === item.key}
                className="w-full h-12 text-base gradient-primary text-primary-foreground"
              >
                {loadingKey === item.key ? "Enviando..." : `Enviar ${item.label}`}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DriverDocuments;