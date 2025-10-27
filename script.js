// Aguarda o HTML carregar
document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores de Elementos (para facilitar) ---
    const $ = (selector) => document.querySelector(selector);
    
    // --- Variáveis de Estado (tradução do useState) ---
    let step = 1;
    let flow = "";
    let amount = "";
    let installments = 6;
    let faturaDelay = "30";
    let result = null;

    // --- Funções Auxiliares (tradução de 'date-fns' e 'calculateIOF') ---
    
    // Função para calcular IOF
    const calculateIOF = (value, dias) => {
        return value * 0.0038 + value * 0.000082 * dias;
    };

    // Função para formatar data (substitui 'date-fns')
    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // --- Função Principal: Simular (tradução de 'simulate') ---
    const simulate = () => {
        const valor = parseFloat(amount);
        if (!valor || isNaN(valor)) return;

        let recommendation = "";
        let detail = "";
        let simulation = {};
        
        const taxaMensal = 0.0499;
        const taxaString = `${(taxaMensal * 100).toFixed(2)}% a.m. + IOF`;

        if (flow === "vista") {
            recommendation = "Pix na Conta";
            simulation = {
                parcelas: 1,
                valorParcela: valor.toFixed(2),
                comecoPagamento: "Hoje",
                taxa: "0%"
            };
            detail = "Pagamento direto com saldo em conta. Sem taxa, sem enrolação. Pronto, tá resolvido!";
        }

        if (flow === "parcelado") {
            const iof = calculateIOF(valor, 45 * installments);
            const valorComIOF = valor + iof;
            const parcela = (valorComIOF * taxaMensal) / (1 - Math.pow(1 + taxaMensal, -installments));
            simulation = {
                parcelas: installments,
                valorParcela: parcela.toFixed(2),
                comecoPagamento: formatDate(new Date(Date.now() + 45 * 86400000)),
                taxa: taxaString
            };
            recommendation = "Pix Parcelado";
            detail = `Divide o valor em até 12x sem travar o limite do seu cartão. Bora agilizar seus planos!`; [cite: 606]
        }

        if (flow === "credito") {
            const juros = valor * taxaMensal;
            const iof = calculateIOF(valor, 30);
            const total = valor + juros + iof;
            simulation = {
                parcelas: 1,
                valorParcela: total.toFixed(2),
                comecoPagamento: "Fatura atual",
                taxa: taxaString
            };
            recommendation = "Pix no Crédito";
            detail = `Use o limite do seu cartão e paga tudo na fatura. Sem tempo ruim.`; [cite: 641]
        }

        if (flow === "paga-depois") {
            const diasDelay = parseInt(faturaDelay);
            const meses = diasDelay / 30;
            const valorComposto = valor * Math.pow(1 + taxaMensal, meses);
            const iof = calculateIOF(valor, diasDelay);
            const total = valorComposto + iof;
            simulation = {
                parcelas: 1,
                valorParcela: total.toFixed(2),
                comecoPagamento: `Daqui a ${diasDelay} dias`,
                taxa: taxaString
            };
            recommendation = "Pix Paga Depois";
            detail = `Respira fundo e paga mais pra frente, com o limite do cartão. O will segura essa.`;
        }

        result = { recommendation, detail, ...simulation };
        displayResult();
        goToStep('step-result');
    };

    // --- Funções de Navegação e Display ---

    // Mostra/esconde as páginas
    const goToStep = (stepId) => {
        document.querySelectorAll('.step-page').forEach(page => {
            page.classList.remove('active');
        });
        $(`#${stepId}`).classList.add('active');
    };

    // Preenche a página de resultado
    const displayResult = () => {
        if (!result) return;
        $('#result-title').innerText = `🎯 Pix ideal pra você: ${result.recommendation}`;
        $('#result-detail').innerText = result.detail;
        $('#result-parcelas').innerText = result.parcelas;
        $('#result-valor-parcela').innerText = `R$ ${result.valorParcela}`;
        $('#result-comeco-pagamento').innerText = result.comecoPagamento;
        $('#result-taxa').innerText = result.taxa;
    };
    
    // Reseta o quiz
    const restart = () => {
        step = 1;
        flow = "";
        amount = "";
        installments = 6;
        faturaDelay = "30";
        result = null;
        
        $('#input-amount').value = "";
        $('#input-installments').value = "6";
        $('#btn-step-1').disabled = true;
        
        goToStep('step-1');
    };

    // --- Event Listeners (ligando os botões) ---

    // Etapa 1
    $('#input-amount').addEventListener('input', (e) => {
        amount = e.target.value;
        $('#btn-step-1').disabled = !amount || parseFloat(amount) <= 0;
    });
    $('#btn-step-1').addEventListener('click', () => goToStep('step-2'));

    // Etapa 2
    $('#btn-flow-vista').addEventListener('click', () => {
        flow = "vista";
        simulate();
    });
    $('#btn-step-3').addEventListener('click', () => goToStep('step-3'));

    // Etapa 3
    $('#btn-goto-step-4').addEventListener('click', () => goToStep('step-4'));
    $('#btn-flow-credito').addEventListener('click', () => {
        flow = "credito";
        simulate();
    });
    $('#btn-goto-step-5').addEventListener('click', () => goToStep('step-5'));

    // Etapa 4
    $('#input-installments').addEventListener('change', (e) => {
        installments = parseInt(e.target.value) || 6;
    });
    $('#btn-flow-parcelado').addEventListener('click', () => {
        flow = "parcelado";
        simulate();
    });

    // Etapa 5
    $('#btn-flow-paga-depois-30').addEventListener('click', () => {
        flow = "paga-depois";
        faturaDelay = "30";
        simulate();
    });
    $('#btn-flow-paga-depois-60').addEventListener('click', () => {
        flow = "paga-depois";
        faturaDelay = "60";
        simulate();
    });
    
    // Resultado
    $('#btn-restart').addEventListener('click', restart);

    // Inicia o simulador
    goToStep('step-1');
});
