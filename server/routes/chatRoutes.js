
import { Router } from 'express';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Nutricionista from '../models/Nutricionista.js';
import Mensagem from '../models/Mensagem.js';
import { autenticarJWT, exigirPaciente } from '../middleware/auth.js';
import SolicitacaoVinculo from '../models/SolicitacaoVinculo.js';

const router = Router();

// Todas as rotas do chat exigem autenticação de paciente.
router.use(autenticarJWT, exigirPaciente);

// Confirma o vínculo ativo antes de permitir acesso às mensagens.
async function obterConversa(req, res) {
  const paciente = await User.findOne({
    _id: req.userId,
    role: 'PACIENTE',
    nutricionistaId: { $ne: null },
    vinculadoEm: { $ne: null },
  }).select('_id nutricionistaId');

  if (!paciente) {
    res.status(403).json({
      mensagem: 'Você precisa estar vinculado a um nutricionista para usar o chat.',
    });
    return null;
  }

  const nutricionista = await Nutricionista.findById(
    paciente.nutricionistaId
  ).select('_id nome');

  if (!nutricionista) {
    res.status(403).json({
      mensagem: 'Nutricionista vinculado não encontrado.',
    });
    return null;
  }

  const solicitacao = await SolicitacaoVinculo.findOne({
  pacienteId: paciente._id,
  nutricionistaId: nutricionista._id,
  status: 'APROVADO',
  encerradaEm: null,
}).lean();

if (!solicitacao) {
  res.status(403).json({
    mensagem: 'Não existe um vínculo ativo aprovado com este nutricionista.',
  });
  return null;
}

  return {
    pacienteId: paciente._id,
    nutricionistaId: nutricionista._id,
  };
}

// GET /chat/mensagens
router.get('/mensagens', async (req, res) => {
  try {
    const conversa = await obterConversa(req, res);
    if (!conversa) return;

    const mensagens = await Mensagem.find(conversa)
      .sort({ createdAt: -1, _id: -1 })
      .limit(100)
      .lean();

    return res.json({
      mensagens: mensagens.reverse(),
    });
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
    return res.status(500).json({
      mensagem: 'Erro ao carregar mensagens.',
    });
  }
});

// POST /chat/mensagens
router.post('/mensagens', async (req, res) => {
  try {
    const conversa = await obterConversa(req, res);
    if (!conversa) return;

    if (typeof req.body?.texto !== 'string') {
      return res.status(400).json({
        mensagem: 'O texto da mensagem é obrigatório.',
      });
    }

    const texto = req.body.texto.trim();

    if (!texto || texto.length > 2000) {
      return res.status(400).json({
        mensagem: 'A mensagem deve conter entre 1 e 2000 caracteres.',
      });
    }

    const mensagem = await Mensagem.create({
      ...conversa,
      remetenteTipo: 'PACIENTE',
      texto,
    });

    return res.status(201).json({ mensagem });
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    return res.status(500).json({
      mensagem: 'Erro ao enviar mensagem.',
    });
  }
});

// PATCH /chat/mensagens/lidas
router.patch('/mensagens/lidas', async (req, res) => {
  try {
    const conversa = await obterConversa(req, res);
    if (!conversa) return;

    const resultado = await Mensagem.updateMany(
      {
        ...conversa,
        remetenteTipo: 'NUTRICIONISTA',
        lidaEm: null,
      },
      {
        $set: { lidaEm: new Date() },
      }
    );

    return res.json({
      sucesso: true,
      atualizadas: resultado.modifiedCount,
    });
  } catch (err) {
    console.error('Erro ao marcar mensagens como lidas:', err);
    return res.status(500).json({
      mensagem: 'Erro ao atualizar mensagens.',
    });
  }
});

export default router;
