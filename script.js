// Configuración de la API
const apiKey = '99dea9f5b0265995c6d0cc18';
const apiURL = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

// Variables globales
let exchangeRates = null;
let isLoading = false;

// Función para obtener las tasas de cambio de la API
async function obtenerTasasDeCambio() {
    try {
        console.log('Obteniendo tasas de cambio...');
        const respuesta = await fetch(apiURL);
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        
        if (datos.result !== 'success') {
            throw new Error('Error en la respuesta de la API');
        }
        
        exchangeRates = datos.conversion_rates;
        console.log('Tasas de cambio obtenidas exitosamente:', exchangeRates);
        
        return exchangeRates;
        
    } catch (error) {
        console.error('Error al obtener tasas de cambio:', error);
        throw error;
    }
}

// Función principal para convertir monedas
async function convertirMonedas() {
    const usdInput = document.getElementById('usdAmount');
    const resultadosDiv = document.getElementById('resultados');
    const convertBtn = document.getElementById('convertBtn');
    
    // Validar entrada
    const monto = parseFloat(usdInput.value);
    
    if (isNaN(monto) || monto <= 0) {
        mostrarError('Por favor, ingresa un monto válido mayor a 0.');
        return;
    }
    
    // Establecer estado de carga
    setLoadingState(true);
    
    try {
        // Obtener tasas de cambio si no están disponibles
        if (!exchangeRates) {
            await obtenerTasasDeCambio();
        }
        
        // Calcular conversiones
        const conversiones = calcularConversiones(monto);
        
        // Mostrar resultados
        mostrarResultados(conversiones);
        
        // Animación de éxito
        resultadosDiv.classList.add('success-animation');
        setTimeout(() => {
            resultadosDiv.classList.remove('success-animation');
        }, 600);
        
    } catch (error) {
        mostrarError('No se pudieron obtener las tasas de cambio. Verifica tu conexión a internet e intenta nuevamente.');
    } finally {
        setLoadingState(false);
    }
}

// Función para calcular las conversiones
function calcularConversiones(montoUSD) {
    const tasas = exchangeRates;
    
    return {
        usd: montoUSD,
        pyg: montoUSD * tasas.PYG,
        ars: montoUSD * tasas.ARS,
        brl: montoUSD * tasas.BRL,
        tasas: {
            pyg: tasas.PYG,
            ars: tasas.ARS,
            brl: tasas.BRL
        }
    };
}

// Función para mostrar los resultados
function mostrarResultados(conversiones) {
    const resultadosDiv = document.getElementById('resultados');
    
    resultadosDiv.innerHTML = `
        <p class="currency-usd">
            💵 <strong>USD (Dólares):</strong> $${conversiones.usd.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}
        </p>
        <p class="currency-pyg">
            🇵🇾 <strong>PYG (Guaraníes):</strong> ₲${conversiones.pyg.toLocaleString('es-PY', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })}
            <small><br>Tasa: 1 USD = ₲${conversiones.tasas.pyg.toLocaleString()}</small>
        </p>
        <p class="currency-ars">
            🇦🇷 <strong>ARS (Pesos Argentinos):</strong> $${conversiones.ars.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}
            <small><br>Tasa: 1 USD = $${conversiones.tasas.ars.toLocaleString()}</small>
        </p>
        <p class="currency-brl">
            🇧🇷 <strong>BRL (Reales Brasileños):</strong> R$${conversiones.brl.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}
            <small><br>Tasa: 1 USD = R$${conversiones.tasas.brl.toLocaleString()}</small>
        </p>
    `;
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const resultadosDiv = document.getElementById('resultados');
    
    resultadosDiv.innerHTML = `
        <div class="error">
            ⚠️ <strong>Error:</strong> ${mensaje}
        </div>
    `;
}

// Función para manejar el estado de carga
function setLoadingState(loading) {
    isLoading = loading;
    const convertBtn = document.getElementById('convertBtn');
    const container = document.querySelector('.converter');
    
    if (loading) {
        convertBtn.textContent = '🔄 Convirtiendo...';
        convertBtn.disabled = true;
        container.classList.add('loading');
    } else {
        convertBtn.textContent = '🔄 Convertir';
        convertBtn.disabled = false;
        container.classList.remove('loading');
    }
}

// Función para manejar la tecla Enter en el input
function handleEnterKey(event) {
    if (event.key === 'Enter' && !isLoading) {
        convertirMonedas();
    }
}

// Función para validar entrada en tiempo real
function validarEntrada() {
    const usdInput = document.getElementById('usdAmount');
    const valor = usdInput.value;
    
    // Remover caracteres no numéricos excepto punto decimal
    usdInput.value = valor.replace(/[^0-9.]/g, '');
    
    // Asegurar solo un punto decimal
    const puntos = usdInput.value.split('.');
    if (puntos.length > 2) {
        usdInput.value = puntos[0] + '.' + puntos.slice(1).join('');
    }
}

// Función de inicialización
function inicializar() {
    console.log('Inicializando aplicación...');
    
    // Agregar event listeners
    const usdInput = document.getElementById('usdAmount');
    const convertBtn = document.getElementById('convertBtn');
    
    // Event listener para la tecla Enter
    usdInput.addEventListener('keypress', handleEnterKey);
    
    // Event listener para validación en tiempo real
    usdInput.addEventListener('input', validarEntrada);
    
    // Enfocar el input al cargar la página
    usdInput.focus();
    
    // Pre-cargar las tasas de cambio
    obtenerTasasDeCambio().catch(error => {
        console.warn('No se pudieron pre-cargar las tasas de cambio:', error);
    });
    
    console.log('Aplicación inicializada correctamente.');
}

// Función para mostrar información de la API
function mostrarInfoAPI() {
    const ahora = new Date();
    console.log(`API ExchangeRate consultada: ${ahora.toLocaleString()}`);
}

// Funciones de utilidad para debugging
window.debugAPI = {
    verTasas: () => console.log('Tasas actuales:', exchangeRates),
    actualizarTasas: obtenerTasasDeCambio,
    limpiarCache: () => {
        exchangeRates = null;
        console.log('Cache de tasas limpiado');
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializar);

// Manejar errores globales
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
});

// Manejar promesas rechazadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada:', event.reason);
    event.preventDefault();
});