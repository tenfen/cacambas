import axios from 'axios';
import * as cheerio from 'cheerio';

class PhoneScrapperService {
  
  static async scrapePhone(phoneSlug) {
    try {
      const url = `https://www.oficinadanet.com.br/smartphones/${phoneSlug}`;
      console.log(`🔍 Buscando: ${url}`);
      
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        timeout: 15000
      });

      const $ = cheerio.load(data);
      
      const specs = {};
      
      $('.ficha-tecnica-box').each((_, section) => {
        const categoryTitle = $(section).find('.ficha-tecnica-title').text().trim();
        
        $(section).find('.ficha-tecnica-tr').each((_, row) => {
          const label = $(row).find('.ficha-tecnica-td:first-child').text().trim();
          const value = $(row).find('.ficha-tecnica-td:last-child').text().trim();
          
          if (label && value) {
            specs[label] = value;
          }
        });
      });

      const phoneData = this.parseSpecs(specs, phoneSlug);
      
      console.log(`✅ Dados extraídos com sucesso!`);
      return phoneData;
      
    } catch (error) {
      console.error('❌ Erro ao fazer scraping:', error.message);
      throw new Error(`Não foi possível buscar dados do telefone: ${error.message}`);
    }
  }

  static parseSpecs(specs, slug) {
    const ramOptions = this.extractRAMOptions(specs['Memória RAM'] || '');
    const storageOptions = this.extractStorageOptions(specs['Armazenamento'] || '');
    
    const processor = specs['Processador'] || '';
    const system = specs['Sistema'] || '';
    const year = this.extractYear(specs['Data lançamento'] || '');
    const broadband = this.extractBroadband(specs);
    
    const phoneTitle = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const variations = this.generateVariations(
      ramOptions,
      storageOptions,
      processor,
      broadband,
      year
    );

    return {
      deviceTitle: phoneTitle,
      deviceProcessor: processor,
      deviceYear: year,
      deviceBroadband: broadband,
      system: system,
      screen: {
        size: specs['Tela - Tamanho'] || '',
        resolution: specs['Tela - Resolução'] || '',
        type: specs['Tela - Tipo'] || '',
        refresh: specs['Tela - Frequência'] || ''
      },
      camera: {
        main: specs['Câmera principal'] || '',
        front: specs['Câm. Selfie'] || ''
      },
      battery: specs['Bateria'] || '',
      dimensions: specs['Dimensões'] || '',
      weight: specs['Peso'] || '',
      variations: variations,
      allSpecs: specs
    };
  }

  static extractRAMOptions(ramText) {
    const rams = [];
    const matches = ramText.match(/(\d+)\s*GB/gi);
    
    if (matches) {
      matches.forEach(match => {
        const ram = match.replace(/\s*GB/i, '').trim();
        if (ram && !rams.includes(ram)) {
          rams.push(ram);
        }
      });
    }
    
    return rams.length > 0 ? rams : ['4'];
  }

  static extractStorageOptions(storageText) {
    const storages = [];
    const matches = storageText.match(/(\d+)\s*GB/gi);
    
    if (matches) {
      matches.forEach(match => {
        const storage = match.replace(/\s*GB/i, '').trim();
        if (storage && !storages.includes(storage)) {
          storages.push(storage);
        }
      });
    }
    
    return storages.length > 0 ? storages : ['128'];
  }

  static extractYear(dateText) {
    const match = dateText.match(/\d{4}/);
    return match ? match[0] : new Date().getFullYear().toString();
  }

  static extractBroadband(specs) {
    if (specs['5G'] === 'Sim') return '5G';
    if (specs['4G'] === 'Sim') return '4G';
    if (specs['3G'] === 'Sim') return '3G';
    return '4G';
  }

  static generateVariations(ramOptions, storageOptions, processor, broadband, year) {
    const variations = [];
    let id = 1;

    ramOptions.forEach(ram => {
      storageOptions.forEach(storage => {
        variations.push({
          id: id++,
          deviceVersion: `${ram}GB/${storage}GB`,
          deviceProcessor: processor,
          deviceMemory: ram,
          deviceStorage: storage,
          deviceBroadband: broadband,
          deviceYear: year,
          devicePrice: {
            new: { minValue: 0, medValue: 0, maxValue: 0 },
            used: { minValue: 0, medValue: 0, maxValue: 0 }
          }
        });
      });
    });

    return variations;
  }

  static formatSlug(searchTerm) {
    return searchTerm
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}

export default PhoneScrapperService;
