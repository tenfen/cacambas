import React from "react";
import { LegalPage } from "./LegalPage";

export function Termos() {
  return (
    <LegalPage title="Termos de Uso">
      <p className="legal-updated">Última atualização: setembro de 2026</p>

      <h2>1. Aceitação dos termos</h2>
      <p>
        Ao criar uma conta ou utilizar o Cacambix ("Plataforma", "Serviço"), você
        concorda com estes Termos de Uso e com a nossa Política de Privacidade. Se
        você não concorda com algum ponto, não utilize o Serviço.
      </p>

      <h2>2. Quem oferece o Serviço</h2>
      <p>
        O Cacambix é oferecido por uma pessoa física, com sede em Palhoça/SC,
        doravante denominada "Cacambix" ou "nós". Caso o Serviço venha a ser
        formalizado sob CNPJ no futuro, este documento será atualizado para
        refletir a nova razão social, mantendo os mesmos compromissos aqui
        assumidos.
      </p>

      <h2>3. Descrição do Serviço</h2>
      <p>O Cacambix é uma plataforma de gestão para locadoras de caçambas, que permite ao usuário:</p>
      <ul>
        <li>Cadastrar e gerenciar sua frota de caçambas (tamanho, status, valor de locação);</li>
        <li>Cadastrar e gerenciar seus próprios clientes (dados de contato, endereço, período de locação);</li>
        <li>Controlar a entrega e o recolhimento de caçambas;</li>
        <li>Acompanhar o faturamento do seu negócio através de um painel (dashboard).</li>
      </ul>

      <h2>4. Cadastro e conta</h2>
      <p>
        Para usar o Cacambix, é necessário criar uma conta, informando dados
        verdadeiros, completos e atualizados (nome, e-mail, telefone e senha).
        Você é responsável por manter a confidencialidade da sua senha e por
        todas as atividades realizadas na sua conta. Avise-nos imediatamente em
        caso de uso não autorizado. O Serviço é destinado a maiores de 18 anos
        ou a pessoas jurídicas devidamente representadas.
      </p>

      <h2>5. Teste grátis</h2>
      <p>
        Novas contas têm direito a um período de teste grátis de 5 (cinco)
        dias, com acesso completo ao Serviço, sem necessidade de informar forma
        de pagamento. Ao final do período de teste, caso não haja assinatura
        ativa, o acesso à conta fica suspenso (os dados cadastrados são
        mantidos) até a confirmação do pagamento da assinatura.
      </p>

      <h2>6. Assinatura e cobrança</h2>
      <p>
        Após o período de teste, o uso do Cacambix está sujeito ao pagamento de
        uma mensalidade no valor de R$ 5,00 (cinco reais), podendo este valor
        ser reajustado mediante aviso prévio. O
        pagamento é processado através do Mercado Pago, via Pix ou cartão de
        crédito, e é cobrado mensalmente de forma recorrente enquanto a
        assinatura estiver ativa. <strong>Não há fidelidade contratual</strong> — você
        paga apenas pelos meses em que optar por manter a assinatura ativa. Em
        caso de não identificação do pagamento, a conta poderá ser suspensa até
        a regularização, sem prejuízo dos dados já cadastrados.
      </p>

      <h2>7. Cancelamento</h2>
      <p>
        Você pode cancelar sua assinatura a qualquer momento. O cancelamento
        interrompe as cobranças futuras; o acesso ao Serviço permanece
        disponível até o fim do período já pago. Não há reembolso proporcional
        a períodos parciais, salvo quando exigido por lei.
      </p>

      <h2>8. Dados que você cadastra sobre seus próprios clientes</h2>
      <p>
        Ao cadastrar dados de clientes seus (nome, telefone, documento,
        endereço) no Cacambix, você é o responsável (controlador, nos termos da
        LGPD) por esses dados perante seus próprios clientes — cabe a você
        garantir que possui base legal adequada para tratá-los (por exemplo, a
        execução do contrato de locação da caçamba) e para informá-los sobre
        esse tratamento. O Cacambix atua, nesse caso, apenas como operador
        desses dados — processa e armazena essas informações em seu nome,
        seguindo suas instruções, sem utilizá-las para finalidade própria.
      </p>

      <h2>9. Uso aceitável</h2>
      <p>
        Você concorda em não utilizar o Cacambix para fins ilícitos, para
        armazenar dados de terceiros sem base legal adequada, ou para tentar
        comprometer a segurança, disponibilidade ou integridade da Plataforma.
      </p>

      <h2>10. Propriedade intelectual</h2>
      <p>
        A marca "Cacambix", o software, o layout e os demais elementos da
        Plataforma são de titularidade do Cacambix, sendo vedada sua
        reprodução, cópia ou uso não autorizado.
      </p>

      <h2>11. Disponibilidade do Serviço</h2>
      <p>
        Empregamos esforços razoáveis para manter o Serviço disponível, mas não
        garantimos disponibilidade ininterrupta. Poderão ocorrer interrupções
        temporárias para manutenção, atualizações ou por motivos fora do nosso
        controle.
      </p>

      <h2>12. Limitação de responsabilidade</h2>
      <p>
        O Cacambix não se responsabiliza por prejuízos decorrentes de uso
        indevido da Plataforma, de dados incorretos inseridos pelo usuário, de
        indisponibilidade de serviços de terceiros (como o Mercado Pago) ou de
        eventos fora do nosso controle razoável.
      </p>

      <h2>13. Alterações nestes termos</h2>
      <p>
        Podemos atualizar estes Termos de Uso periodicamente. Alterações
        relevantes serão comunicadas por e-mail ou através da própria
        Plataforma, com antecedência razoável.
      </p>

      <h2>14. Rescisão</h2>
      <p>
        Podemos suspender ou encerrar sua conta em caso de violação destes
        Termos, inadimplência não regularizada, ou uso indevido do Serviço.
      </p>

      <h2>15. Foro</h2>
      <p>
        Fica eleito o foro da comarca de Palhoça/SC para dirimir eventuais
        controvérsias decorrentes destes Termos, com renúncia a qualquer outro,
        por mais privilegiado que seja.
      </p>

      <h2>16. Contato</h2>
      <p>Dúvidas sobre estes Termos podem ser enviadas para crtenfen@gmail.com.</p>
    </LegalPage>
  );
}

export default Termos;
