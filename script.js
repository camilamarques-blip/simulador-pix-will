// Aguarda o HTML carregar
document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores de Elementos ---
    const $ = (selector) => document.querySelector(selector);
    
    // --- Variáveis de Estado ---
    let flow = "";
    let amount = "";
    let installments = 6;
    let faturaDelay = "30";
    let result = null;

    // --- Funções Auxiliares ---
    
    const calculateIOF = (value, dias) => {
        return value * 0.0038 + value * 0.000082 * dias;
    };

    const formatDate = (date) => {
        const d = new Date(date);
        // Adiciona o fuso horário para corrigir a data
        const userTimezoneOffset = d.getTimezoneOffset() * 60000;
        const dCorrigida = new Date(d.getTime() + userTimezoneOffset);
        
        const day = String(dCorrigida.getDate()).padStart(2, '0');
        const month = String(dCorrigida.getMonth() + 1).padStart(2, '0');
        const year = dCorrigida.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // --- Função Principal: Simular ---
    const simulate = () => {
        const valor = parseFloat(amount);
        if (!valor || isNaN(valor)) return;

        let recommendation = "";
        let detail = "";
        let simulation = {};
        
        const taxaMensal = 0.0499;
        const taxaString = `${(taxaMensal * 100).toFixed(2)}% a.m. + IOF`;

        // Lógica de Comparativo
        const calcularTotalCredito = (valorBase) => {
            const juros = valorBase * taxaMensal;
            const iof = calculateIOF(valorBase, 30);
            return valorBase + juros + iof;
        };

        const calcularTotalParcelado = (valorBase, numParcelas) => {
            const iof = calculateIOF(valorBase, 45 * numParcelas); // Simplificação do IOF
            const valorComIOF = valorBase + iof;
            const parcela = (valorComIOF * taxaMensal) / (1 - Math.pow(1 + taxaMensal, -numParcelas));
            return parcela * numParcelas;
        };

        if (flow === "vista") {
            recommendation = "Pix na Conta";
            simulation = {
                valorOriginal: valor.toFixed(2),
                parcelas: 1,
                valorParcela: valor.toFixed(2),
                comecoPagamento: "Hoje",
                taxa: "0%",
                valorTotalPago: valor.toFixed(2),
                comparison: null
            };
            detail = "Pagamento direto com saldo em conta. Sem taxa, sem enrolação. Pronto, tá resolvido!";
        }

        if (flow === "parcelado") {
            const iof = calculateIOF(valor, 45 * installments);
            const valorComIOF = valor + iof;
            const parcela = (valorComIOF * taxaMensal) / (1 - Math.pow(1 + taxaMensal, -installments));
            const totalPago = parcela * installments;
            
            // Comparativo
            const totalCredito = calcularTotalCredito(valor);
            
            simulation = {
                valorOriginal: valor.toFixed(2),
                parcelas: installments,
                valorParcela: parcela.toFixed(2),
                comecoPagamento: formatDate(new Date(Date.now() + 45 * 86400000)),
                taxa: taxaString,
                valorTotalPago: totalPago.toFixed(2),
                comparison: {
                    tipo: "Pix no Crédito",
                    valorTotal: totalCredito.toFixed(2)
                }
            };
            recommendation = "Pix Parcelado";
            detail = `Divide o valor em até 12x sem travar o limite do seu cartão. Bora agilizar seus planos!`;
        }

        if (flow === "credito") {
            const totalPago = calcularTotalCredito(valor);
            
            // Comparativo (usando 6 parcelas como padrão)
            const defaultInstallments = 6;
            const totalParcelado = calcularTotalParcelado(valor, defaultInstallments);

            simulation = {
                valorOriginal: valor.toFixed(2),
                parcelas: 1,
                valorParcela: totalPago.toFixed(2),
                comecoPagamento: "Fatura atual",
                taxa: taxaString,
                valorTotalPago: totalPago.toFixed(2),
                comparison: {
                    tipo: `Pix Parcelado (em ${defaultInstallments}x)`,
                    valorTotal: totalParcelado.toFixed(2)
                }
            };
            recommendation = "Pix no Crédito";
            detail = `Use o limite do seu cartão e paga tudo na fatura. Sem tempo ruim.`;
        }

        if (flow === "paga-depois") {
            const diasDelay = parseInt(faturaDelay);
            const meses = diasDelay / 30;
            const valorComposto = valor * Math.pow(1 + taxaMensal, meses);
            const iof = calculateIOF(valor, diasDelay);
            const totalPago = valorComposto + iof;
            
            simulation = {
                valorOriginal: valor.toFixed(2),
                parcelas: 1,
                valorParcela: totalPago.toFixed(2),
                comecoPagamento: `Daqui a ${diasDelay} dias`,
                taxa: taxaString,
                valorTotalPago: totalPago.toFixed(2),
                comparison: null // Sem comparativo para este
            };
            recommendation = "Pix Paga Depois";
            detail = `Respira fundo e paga mais pra frente, com o limite do cartão. O will segura essa.`;
        }

        result = { recommendation, detail, ...simulation };
        displayResult();
        goToStep('step-result');
    };

    // --- Funções de Navegação e Display ---

    const goToStep = (stepId) => {
        document.querySelectorAll('.step-page').forEach(page => {
            page.classList.remove('active');
        });
        $(`#${stepId}`).classList.add('active');
    };

    const displayResult = () => {
        if (!result) return;
        
        // Esconde campos que não fazem sentido
        $('#li-valor-original').style.display = (flow === 'vista' ? 'none' : 'flex');
        $('#li-valor-total-pago').style.display = (flow === 'vista' ? 'none' : 'flex');

        // Preenche os dados
        $('#result-title').innerHTML = `🎯 Pix ideal pra você: <strong>${result.recommendation}</strong>`;
        $('#result-detail').innerText = result.detail;
        $('#result-valor-original').innerText = `R$ ${result.valorOriginal}`;
        $('#result-parcelas').innerText = result.parcelas;
        $('#result-valor-parcela').innerText = `R$ ${result.valorParcela}`;
        $('#result-comeco-pagamento').innerText = result.comecoPagamento;
        $('#result-taxa').innerText = result.taxa;
        $('#result-valor-total-pago').innerText = `R$ ${result.valorTotalPago}`;
        
        // Preenche o comparativo
        const comparisonBox = $('#result-comparison-box');
        const comparisonText = $('#comparison-text');
        
        if (result.comparison) {
            comparisonText.innerHTML = `No <strong>${result.comparison.tipo}</strong>, o valor total seria <strong>R$ ${result.comparison.valorTotal}</strong>.`;
            comparisonBox.style.display = 'block';
        } else {
            comparisonBox.style.display = 'none';
        }
    };
    
    const restart = () => {
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

    // --- Event Listeners ---

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
