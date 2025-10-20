import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { requestId, email, summary } = await request.json();

    // For now, we'll just store the email that would be sent
    // In production, integrate with SendGrid or Resend
    // Email would be sent to: email
    // Request ID: requestId
    // Summary: summary

    // Email template content (for future implementation)
    const emailContent = {
      to: email,
      subject: `Confirmação de Solicitação de Viagem - ${requestId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .section { margin-bottom: 20px; padding: 15px; background: white; border-radius: 5px; }
            .section h3 { color: #4CAF50; margin-top: 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .info-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; }
            .label { font-weight: bold; }
            .value { color: #555; }
            .reference-number { font-size: 24px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; background: #f0f8f0; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Solicitação de Viagem Confirmada</h1>
            </div>
            
            <div class="content">
              <p>Prezado(a) ${summary.personalInfo.passengerName},</p>
              
              <p>Sua solicitação de viagem foi recebida com sucesso e está em análise.</p>
              
              <div class="reference-number">
                Número de Referência: ${requestId}
              </div>
              
              <div class="section">
                <h3>Detalhes da Viagem</h3>
                <div class="info-grid">
                  <div class="label">Origem:</div>
                  <div class="value">${summary.travelDetails.origin}</div>
                  
                  <div class="label">Destino:</div>
                  <div class="value">${summary.travelDetails.destination}</div>
                  
                  <div class="label">Data de Ida:</div>
                  <div class="value">${new Date(summary.travelDetails.departureDate).toLocaleDateString('pt-BR')}</div>
                  
                  <div class="label">Data de Volta:</div>
                  <div class="value">${new Date(summary.travelDetails.returnDate).toLocaleDateString('pt-BR')}</div>
                  
                  <div class="label">Tipo de Transporte:</div>
                  <div class="value">${summary.travelDetails.transportType}</div>
                </div>
              </div>
              
              <div class="section">
                <h3>Objetivo da Viagem</h3>
                <p>${summary.additionalInfo.tripObjective}</p>
              </div>
              
              <div class="section">
                <h3>Próximos Passos</h3>
                <ul>
                  <li>Sua solicitação será analisada pela equipe responsável</li>
                  <li>Você receberá uma notificação quando houver atualização no status</li>
                  <li>Tempo médio de processamento: 48 horas úteis</li>
                  <li>Em caso de urgência, entre em contato com o setor responsável</li>
                </ul>
              </div>
              
              <p><strong>Importante:</strong> Guarde este número de referência para acompanhamento da sua solicitação.</p>
            </div>
            
            <div class="footer">
              <p>Este é um e-mail automático. Por favor, não responda.</p>
              <p>© ${new Date().getFullYear()} Sistema de Solicitação de Viagens</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Confirmação de Solicitação de Viagem - ${requestId}
        
        Prezado(a) ${summary.personalInfo.passengerName},
        
        Sua solicitação de viagem foi recebida com sucesso e está em análise.
        
        Número de Referência: ${requestId}
        
        Detalhes da Viagem:
        - Origem: ${summary.travelDetails.origin}
        - Destino: ${summary.travelDetails.destination}
        - Data de Ida: ${new Date(summary.travelDetails.departureDate).toLocaleDateString('pt-BR')}
        - Data de Volta: ${new Date(summary.travelDetails.returnDate).toLocaleDateString('pt-BR')}
        
        Objetivo: ${summary.additionalInfo.tripObjective}
        
        Próximos Passos:
        - Sua solicitação será analisada pela equipe responsável
        - Você receberá uma notificação quando houver atualização no status
        - Tempo médio de processamento: 48 horas úteis
        
        Guarde este número de referência para acompanhamento.
        
        Este é um e-mail automático. Por favor, não responda.
      `
    };

    // TODO: Implement actual email sending with SendGrid or Resend
    // For now, we'll just return success
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email confirmation logged (not sent in development)',
      emailContent // Return for debugging in development
    });

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}