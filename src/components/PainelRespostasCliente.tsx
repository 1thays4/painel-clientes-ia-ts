import { supabase } from "../lib/supabase";
import { Mensagem } from "../services/cliente";
import {
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
  useTheme,
  Alert,
  AlertTitle,
} from "@mui/material";
import ClienteSelector from "./ClienteSelector";
import ClienteFinalSelector from "./ClienteFinalSelector";
import MensagemGrupo from "./MensagemGrupo";
import FormattedText from "./FormattedText";
import ControleNotificacoes from "./ControleNotificacoes";
import CadastrarContato from "./CadastrarContato";
import { config } from "../config";
import axios from "axios";
import { anonymizeName, anonymizePhone, isDemoMode } from "../utils/anonymize";
import "react-toastify/dist/ReactToastify.css";
// CSS global removido - será adicionado em _app.js
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { formatarTelefone } from "../utils";
import { notificacaoService } from "../services/notificacoes";
import { buscarClienteFinalPorId } from "../services/cliente-final";

interface PainelRespostasClienteProps {
  clienteId: string | number;
  mensagens: Mensagem[];
  onAtualizarHistorico: (
    resetarPaginacao?: boolean,
    clienteFinalId?: string | number | null,
  ) => void;
  onCarregarMais?: () => void;
  totalMensagens?: number;
  isAdmin?: boolean;
  carregandoMais?: boolean;
}

export default function PainelRespostasCliente({
  clienteId,
  mensagens,
  onAtualizarHistorico,
  onCarregarMais,
  totalMensagens = 0,
  isAdmin = false,
  carregandoMais = false,
}: PainelRespostasClienteProps) {
  const theme = useTheme();
  const [resposta, setResposta] = useState("");
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [mensagemSelecionada, setMensagemSelecionada] = useState<
    string | number | null
  >(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<
    string | number | null
  >(clienteId);
  const [clienteFinalSelecionado, setClienteFinalSelecionado] = useState<
    string | number | null
  >(null);
  const [clientesFinaisInfo, setClientesFinaisInfo] = useState<
    Record<string | number, { modoBotAtivo: boolean }>
  >({});
  const mensagensAnteriorRef = useRef<Mensagem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mostrarCadastroContato, setMostrarCadastroContato] = useState(false);

  // Função para determinar o número do cliente final
  const getNumeroClienteFinal = (msg: Mensagem): string => {
    // Prioridade 1: numero_destino se não for igual ao whatsapp_cliente
    if (msg.numero_destino && msg.numero_destino !== msg.whatsapp_cliente) {
      const numeroFormatado = formatarTelefone(msg.numero_destino);
      return isDemoMode() ? anonymizePhone(numeroFormatado) : numeroFormatado;
    }

    // Prioridade 2: numero_remetente se não for igual ao whatsapp_cliente
    if (msg.numero_remetente && msg.numero_remetente !== msg.whatsapp_cliente) {
      return isDemoMode() ? anonymizePhone(msg.numero_remetente) : msg.numero_remetente;
    }

    // Prioridade 3: whatsapp_cliente_final
    if (msg.whatsapp_cliente_final) {
      return isDemoMode() ? anonymizePhone(msg.whatsapp_cliente_final) : msg.whatsapp_cliente_final;
    }

    return "";
  };

  // Enviar resposta humana
  const enviarRespostaHumana = async () => {
    if (!mensagemSelecionada || !resposta.trim()) {
      toast.error("Digite uma resposta");
      return;
    }

    setEnviandoResposta(true);
    try {
      // Obter a mensagem selecionada para ter acesso aos dados do cliente
      const msgSelecionada = mensagens.find(
        (m) => m.id === mensagemSelecionada,
      );
      if (!msgSelecionada) {
        toast.error("Mensagem não encontrada");
        return;
      }

      // Atualizar a mensagem no banco de dados
      const { error } = await supabase
        .from("mensagens_enviadas")
        .update({ resposta_humana: resposta.trim() })
        .eq("id", mensagemSelecionada);

      if (error) {
        console.error("Erro ao enviar resposta:", error);
        toast.error("Erro ao enviar resposta");
        return;
      }

      // Enviar a resposta para o webhook do n8n (se configurado)
      if (
        config.N8N_WEBHOOK_URL &&
        !config.N8N_WEBHOOK_URL.includes("localhost")
      ) {
        try {
          // Obter o número do cliente final
          const numeroDestino = getNumeroClienteFinal(msgSelecionada);
          const numeroRemetente = msgSelecionada.whatsapp_cliente || "";

          // Validar número de destino (deve ser um número válido com pelo menos 8 dígitos)
          if (!numeroDestino || numeroDestino.length < 8) {
            console.log("Número de WhatsApp de destino inválido ou ausente");
            toast.warning(
              "Resposta salva no sistema, mas não enviada por WhatsApp (número inválido)",
            );
            return;
          }

          // Formatar número para garantir que esteja no formato correto para o Twilio
          // Twilio espera números no formato internacional (ex: +5511999999999)
          const formatarNumeroInternacional = (numero: string): string => {
            // Remover qualquer caractere não numérico
            const apenasDigitos = numero.replace(/\D/g, "");

            // Adicionar o prefixo + se não existir
            return apenasDigitos.startsWith("55")
              ? `+${apenasDigitos}`
              : `+55${apenasDigitos}`;
          };

          // Preparar os dados para o webhook
          const webhookData = {
            mensagem: resposta.trim(),
            numeroDestino: formatarNumeroInternacional(numeroDestino),
            numeroRemetente: numeroRemetente
              ? formatarNumeroInternacional(numeroRemetente)
              : "sistema",
            tipoMensagem: "resposta_humana",
            mensagemId: mensagemSelecionada,
          };

          // Enviar para o webhook do n8n com timeout reduzido
          await axios.post(config.N8N_WEBHOOK_URL, webhookData, {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 3000, // 3 segundos de timeout
          });
          console.log("Resposta enviada para o webhook do n8n");
        } catch (webhookError) {
          console.log("Erro ao enviar para webhook:", webhookError);
          toast.warning(
            "Resposta salva, mas pode não ter sido enviada para o WhatsApp",
          );
        }
      }

      toast.success("Resposta enviada com sucesso!");
      setResposta("");
      setMensagemSelecionada(null);
      onAtualizarHistorico(true, clienteFinalSelecionado);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Ocorreu um erro ao enviar a resposta");
    } finally {
      setEnviandoResposta(false);
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dia = date.getDate().toString().padStart(2, "0");
    const mes = (date.getMonth() + 1).toString().padStart(2, "0");
    const ano = date.getFullYear();
    const hora = date.getHours().toString().padStart(2, "0");
    const minutos = date.getMinutes().toString().padStart(2, "0");

    return `${dia}/${mes}/${ano} às ${hora}h${minutos}`;
  };

  // Efeito para atualizar o cliente selecionado quando o clienteId mudar
  useEffect(() => {
    setClienteSelecionado(clienteId);
  }, [clienteId]);

  // Efeito para buscar informações dos clientes finais
  useEffect(() => {
    if (!mensagens.length) return;

    const carregarClientesFinaisInfo = async () => {
      // Extrair IDs únicos de clientes finais das mensagens
      const clientesFinaisIds = new Set<string | number>();
      mensagens.forEach((msg) => {
        if (msg.cliente_final_id) {
          clientesFinaisIds.add(msg.cliente_final_id);
        }
      });

      if (clientesFinaisIds.size === 0) return;

      // Buscar informações de cada cliente final
      const infoMap: Record<string | number, { modoBotAtivo: boolean }> = {};

      for (const id of Array.from(clientesFinaisIds)) {
        const clienteFinal = await buscarClienteFinalPorId(id);
        if (clienteFinal) {
          infoMap[id] = {
            modoBotAtivo: clienteFinal.modo === true, // Usar o valor exato do banco de dados
          };
        }
      }

      setClientesFinaisInfo(infoMap);
    };

    carregarClientesFinaisInfo();
  }, [mensagens]);

  // Efeito para verificar novas mensagens e tocar notificação
  useEffect(() => {
    // Se não há mensagens anteriores registradas, apenas armazenar as atuais
    if (mensagensAnteriorRef.current.length === 0) {
      mensagensAnteriorRef.current = [...mensagens];
      return;
    }

    // Verificar se há novas mensagens
    const mensagensAnterioresIds = new Set(
      mensagensAnteriorRef.current.map((m) => m.id),
    );
    const novasMensagens = mensagens.filter(
      (m) => !mensagensAnterioresIds.has(m.id),
    );

    // Se houver novas mensagens, tocar notificação
    if (novasMensagens.length > 0) {
      notificacaoService.tocarNotificacao();
      toast.info(`${novasMensagens.length} nova(s) mensagem(ns) recebida(s)`);
    }

    // Atualizar referência de mensagens anteriores
    mensagensAnteriorRef.current = [...mensagens];
  }, [mensagens]);

  // Efeito para rolar para o final quando as mensagens mudarem
  useEffect(() => {
    if (mensagemSelecionada) {
      const scrollContainer = document.querySelector(
        ".mensagens-scroll-container",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [mensagemSelecionada, mensagens.length]);

  // Função para lidar com a mudança de cliente selecionado
  const handleClienteSelecionado = (
    novoClienteId: string | number | null,
    tipo?: "empresa" | "cliente_final",
  ) => {
    if (tipo === "cliente_final") {
      // Se for um cliente final, definir como cliente final selecionado
      setClienteFinalSelecionado(novoClienteId);
      console.log("Cliente final selecionado:", novoClienteId);
      // Manter o cliente principal atual
    } else {
      // Se for uma empresa ou null, atualizar o cliente selecionado
      setClienteSelecionado(novoClienteId);
      setClienteFinalSelecionado(null); // Resetar o cliente final quando mudar a empresa
    }

    setMensagemSelecionada(null);
    setResposta("");
    // Passar o ID do cliente final para a função onAtualizarHistorico
    onAtualizarHistorico(true, tipo === "cliente_final" ? novoClienteId : null);
  };

  // Função para lidar com a mudança de cliente final selecionado
  const handleClienteFinalSelecionado = (
    novoClienteFinalId: string | number | null,
  ) => {
    setClienteFinalSelecionado(novoClienteFinalId);
    setMensagemSelecionada(null);
    setResposta("");
    onAtualizarHistorico(true, novoClienteFinalId);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {isAdmin && (
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.default,
          }}
        >
          <ClienteSelector
            onClienteSelecionado={handleClienteSelecionado}
            clienteSelecionado={clienteSelecionado}
            empresaId={clienteId}
          />
        </Box>
      )}

      {/* Layout estilo WhatsApp */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Lista de contatos (lado esquerdo) */}
        <Box
          sx={{
            width: 300,
            borderRight: `1px solid ${theme.palette.divider}`,
            display: "flex",
            flexDirection: "column",
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.primary.dark,
              color: theme.palette.primary.contrastText,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              Conversas
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                size="small"
                onClick={() => setMostrarCadastroContato(true)}
                sx={{
                  color: "white",
                  minWidth: "auto",
                  p: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
                title="Cadastrar novo contato"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="19" y1="8" x2="19" y2="14"></line>
                  <line x1="22" y1="11" x2="16" y2="11"></line>
                </svg>
              </Button>
              <ControleNotificacoes />
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "scroll",
              overflowX: "hidden",
              height: "400px",
              maxHeight: "400px",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(0,0,0,0.05)",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0,0,0,0.2)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(0,0,0,0.3)",
              },
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,0,0,0.2) rgba(0,0,0,0.05)",
            }}
          >
            {mensagens.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                <Typography>Nenhuma conversa encontrada</Typography>
              </Box>
            ) : (
              <MensagemGrupo
                mensagens={mensagens}
                clienteId={clienteSelecionado}
                onMensagemSelecionada={setMensagemSelecionada}
                mensagemSelecionada={mensagemSelecionada}
                showBotToggle={true}
              />
            )}

            {/* Botão para carregar mais mensagens */}
            {onCarregarMais && mensagens.length < totalMensagens && (
              <Box sx={{ p: 2 }}>
                <Button
                  variant="text"
                  onClick={onCarregarMais}
                  disabled={carregandoMais}
                  fullWidth
                  size="small"
                  startIcon={
                    carregandoMais ? <CircularProgress size={16} /> : null
                  }
                >
                  {carregandoMais ? "Carregando..." : `Carregar mais mensagens`}
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {/* Área de conversa (lado direito) */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            bgcolor: theme.palette.background.default,
          }}
        >
          {!mensagemSelecionada ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: 2,
                color: "text.secondary",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <Typography variant="h6">Chat</Typography>
              <Typography variant="body2" align="center" sx={{ maxWidth: 400 }}>
                Selecione uma conversa para ver as mensagens e responder ao
                cliente.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Cabeçalho da conversa */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.primary.dark,
                  color: theme.palette.primary.contrastText,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {(() => {
                  const msgSelecionada = mensagens.find(
                    (m) => m.id === mensagemSelecionada,
                  );
                  if (!msgSelecionada) return null;

                  return (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: theme.palette.primary.main,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mr: 2,
                        }}
                      >
                        <Typography variant="h6" color="white">
                          {isDemoMode()
                            ? anonymizeName(
                                msgSelecionada.nome_cliente_final || "?",
                                "person",
                              ).charAt(0)
                            : msgSelecionada.nome_cliente_final?.charAt(0) || "?"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1">
                          {isDemoMode()
                            ? anonymizeName(
                                msgSelecionada.nome_cliente_final,
                                "person",
                              )
                            : msgSelecionada.nome_cliente_final}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.8)" }}
                        >
                          {getNumeroClienteFinal(msgSelecionada)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })()}

                <Button
                  variant="text"
                  size="small"
                  onClick={() => setMensagemSelecionada(null)}
                  sx={{
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  Voltar
                </Button>
              </Box>

              {/* Área de mensagens - Todas as mensagens do cliente */}
              <Box
                className="mensagens-scroll-container"
                sx={{
                  flex: 1,
                  p: 2,
                  height: "400px",
                  maxHeight: "400px",
                  overflowY: "scroll",
                  overflowX: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  bgcolor: theme.palette.background.default,
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(255,255,255,0.1)",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(0,0,0,0.15)",
                    borderRadius: "3px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "rgba(0,0,0,0.25)",
                  },
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(0,0,0,0.15) rgba(255,255,255,0.1)",
                }}
              >
                {(() => {
                  // Encontrar todas as mensagens do mesmo cliente final
                  const msgSelecionada = mensagens.find(
                    (m) => m.id === mensagemSelecionada,
                  );
                  if (!msgSelecionada) return null;

                  // Filtrar todas as mensagens do mesmo cliente final
                  const clienteFinalId = msgSelecionada.cliente_final_id;
                  const todasMensagensDoCliente = mensagens
                    .filter((m) => m.cliente_final_id === clienteFinalId)
                    .sort(
                      (a, b) =>
                        new Date(a.timestamp).getTime() -
                        new Date(b.timestamp).getTime(),
                    ); // Ordem cronológica (antigas primeiro)

                  // Agrupar mensagens por data no formato do WhatsApp
                  const mensagensPorData: Record<string, Mensagem[]> = {};
                  todasMensagensDoCliente.forEach((msg) => {
                    const msgDate = new Date(msg.timestamp);
                    const hoje = new Date();
                    const ontem = new Date(hoje);
                    ontem.setDate(hoje.getDate() - 1);

                    // Formatar a data no estilo WhatsApp
                    let dataFormatada;
                    if (msgDate.toDateString() === hoje.toDateString()) {
                      dataFormatada = "HOJE";
                    } else if (
                      msgDate.toDateString() === ontem.toDateString()
                    ) {
                      dataFormatada = "ONTEM";
                    } else {
                      // Para datas mais antigas, usar o formato dd/mm/yyyy
                      dataFormatada = msgDate.toLocaleDateString();
                    }

                    if (!mensagensPorData[dataFormatada]) {
                      mensagensPorData[dataFormatada] = [];
                    }
                    mensagensPorData[dataFormatada].push(msg);
                  });

                  // Ordenar as datas (mais antigas primeiro) com prioridade cronológica
                  const datasOrdenadas = Object.keys(mensagensPorData).sort(
                    (a, b) => {
                      if (a === "HOJE") return 1; // HOJE vai para o final
                      if (b === "HOJE") return -1;
                      if (a === "ONTEM" && b !== "HOJE") return 1; // ONTEM vai antes de HOJE
                      if (b === "ONTEM" && a !== "HOJE") return -1;
                      // Para outras datas, ordenar cronologicamente (antigas primeiro)
                      return new Date(a).getTime() - new Date(b).getTime();
                    },
                  );

                  // Usar a referência para rolagem já definida no nível superior do componente

                  return (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        paddingBottom: "20px",
                        minHeight: "100%",
                      }}
                    >
                      {datasOrdenadas.map((data) => {
                        const msgs = mensagensPorData[data];
                        return (
                          <Box
                            key={data}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            {/* Data da mensagem estilo WhatsApp */}
                            <Box
                              sx={{
                                alignSelf: "center",
                                mb: 2,
                                mt: 2,
                                position: "relative",
                                width: "100%",
                                textAlign: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  position: "relative",
                                  "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    top: "50%",
                                    left: 0,
                                    right: 0,
                                    height: "1px",
                                    backgroundColor: "rgba(0,0,0,0.1)",
                                    zIndex: 0,
                                  },
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "inline-block",
                                    bgcolor: "rgba(225, 245, 254, 0.92)",
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 4,
                                    position: "relative",
                                    zIndex: 1,
                                    boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                                    color: theme.palette.text.secondary,
                                    fontWeight: 500,
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {data}
                                </Typography>
                              </Box>
                            </Box>

                            {msgs.map((msg) => (
                              <Box
                                key={msg.id}
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 2,
                                }}
                              >
                                {/* Mensagem do cliente */}
                                <Box
                                  sx={{
                                    alignSelf: "flex-start",
                                    maxWidth: "70%",
                                    bgcolor: "white",
                                    p: 2,
                                    borderRadius: "0.8rem",
                                    boxShadow:
                                      "0 1px 0.5px rgba(11,20,26,0.13)",
                                    overflowWrap: "break-word",
                                  }}
                                >
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      whiteSpace: "pre-wrap",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {msg?.pergunta || "Mensagem sem conteúdo"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "text.secondary",
                                      display: "block",
                                      textAlign: "right",
                                      mt: 1,
                                    }}
                                  >
                                    {new Date(msg.timestamp).toLocaleTimeString(
                                      [],
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}
                                  </Typography>
                                </Box>

                                {/* Resposta da IA */}
                                {msg?.resposta && (
                                  <Box
                                    sx={{
                                      alignSelf: "flex-end",
                                      maxWidth: "70%",
                                      bgcolor: theme.custom.chatbot.botMessage,
                                      p: 2,
                                      borderRadius: "0.8rem",
                                      boxShadow:
                                        "0 1px 0.5px rgba(11,20,26,0.13)",
                                      overflowWrap: "break-word",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: "medium",
                                        color: theme.palette.primary.main,
                                        mb: 1,
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      Resposta Automática
                                    </Typography>
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {msg.resposta}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "text.secondary",
                                        display: "block",
                                        textAlign: "right",
                                        mt: 1,
                                      }}
                                    >
                                      {new Date(
                                        msg.timestamp,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </Typography>
                                  </Box>
                                )}

                                {/* Resposta humana */}
                                {msg?.resposta_humana && (
                                  <Box
                                    sx={{
                                      alignSelf: "flex-end",
                                      maxWidth: "70%",
                                      bgcolor: theme.custom.chatbot.botMessage,
                                      p: 2,
                                      borderRadius: "0.8rem",
                                      boxShadow:
                                        "0 1px 0.5px rgba(11,20,26,0.13)",
                                      overflowWrap: "break-word",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: "medium",
                                        color: theme.palette.primary.main,
                                        mb: 1,
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      Sua Resposta
                                    </Typography>
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {msg.resposta_humana}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "text.secondary",
                                        display: "block",
                                        textAlign: "right",
                                        mt: 1,
                                      }}
                                    >
                                      {new Date(
                                        msg.timestamp,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </Box>
                        );
                      })}
                      {/* Espaço extra no final para melhor visualização */}
                      <div style={{ height: 20 }} />
                    </Box>
                  );
                })()}
              </Box>

              {/* Área de digitação */}
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: theme.palette.background.default,
                  borderTop: `1px solid ${theme.palette.divider}`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  height: "100px",
                  minHeight: "100px",
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  InputProps={{
                    sx: { whiteSpace: "pre-wrap", overflowWrap: "break-word" },
                  }}
                  placeholder="Digite uma mensagem"
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "18px",
                      backgroundColor: "white",
                    },
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  disabled={enviandoResposta || !resposta.trim()}
                  onClick={enviarRespostaHumana}
                  sx={{
                    height: 40,
                    width: 40,
                    minWidth: 40,
                    borderRadius: "50%",
                    bgcolor: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.dark,
                    },
                  }}
                >
                  {enviandoResposta ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 2L11 13"></path>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  )}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Modal de cadastro de contato */}
      <CadastrarContato
        open={mostrarCadastroContato}
        onClose={() => setMostrarCadastroContato(false)}
        clienteId={clienteId}
        onContatoCadastrado={() => onAtualizarHistorico(true)}
      />
    </Box>
  );
}
