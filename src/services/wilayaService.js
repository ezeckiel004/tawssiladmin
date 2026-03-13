// src/services/wilayaService.js
import api from './api';

const wilayaService = {
  /**
   * Récupérer toutes les wilayas depuis l'API
   */
  async getAllWilayas() {
    try {
      const response = await api.get('/wilayas');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des wilayas:', error);
      // Fallback sur la liste locale
      return this.getWilayasList();
    }
  },

  /**
   * Récupérer les communes d'une wilaya
   */
  async getCommunes(wilayaCode) {
    try {
      const response = await api.get(`/wilayas/${wilayaCode}/communes`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des communes:', error);
      return [];
    }
  },

  /**
   * Liste complète des wilayas algériennes avec codes
   */
  getWilayasList() {
    return [
      { code: '01', nom: 'Adrar' },
      { code: '02', nom: 'Chlef' },
      { code: '03', nom: 'Laghouat' },
      { code: '04', nom: 'Oum El Bouaghi' },
      { code: '05', nom: 'Batna' },
      { code: '06', nom: 'Béjaïa' },
      { code: '07', nom: 'Biskra' },
      { code: '08', nom: 'Béchar' },
      { code: '09', nom: 'Blida' },
      { code: '10', nom: 'Bouira' },
      { code: '11', nom: 'Tamanrasset' },
      { code: '12', nom: 'Tébessa' },
      { code: '13', nom: 'Tlemcen' },
      { code: '14', nom: 'Tiaret' },
      { code: '15', nom: 'Tizi Ouzou' },
      { code: '16', nom: 'Alger' },
      { code: '17', nom: 'Djelfa' },
      { code: '18', nom: 'Jijel' },
      { code: '19', nom: 'Sétif' },
      { code: '20', nom: 'Saïda' },
      { code: '21', nom: 'Skikda' },
      { code: '22', nom: 'Sidi Bel Abbès' },
      { code: '23', nom: 'Annaba' },
      { code: '24', nom: 'Guelma' },
      { code: '25', nom: 'Constantine' },
      { code: '26', nom: 'Médéa' },
      { code: '27', nom: 'Mostaganem' },
      { code: '28', nom: 'M\'Sila' },
      { code: '29', nom: 'Mascara' },
      { code: '30', nom: 'Ouargla' },
      { code: '31', nom: 'Oran' },
      { code: '32', nom: 'El Bayadh' },
      { code: '33', nom: 'Illizi' },
      { code: '34', nom: 'Bordj Bou Arréridj' },
      { code: '35', nom: 'Boumerdès' },
      { code: '36', nom: 'El Tarf' },
      { code: '37', nom: 'Tindouf' },
      { code: '38', nom: 'Tissemsilt' },
      { code: '39', nom: 'El Oued' },
      { code: '40', nom: 'Khenchela' },
      { code: '41', nom: 'Souk Ahras' },
      { code: '42', nom: 'Tipaza' },
      { code: '43', nom: 'Mila' },
      { code: '44', nom: 'Aïn Defla' },
      { code: '45', nom: 'Naâma' },
      { code: '46', nom: 'Aïn Témouchent' },
      { code: '47', nom: 'Ghardaïa' },
      { code: '48', nom: 'Relizane' },
      { code: '49', nom: 'Timimoun' },
      { code: '50', nom: 'Bordj Badji Mokhtar' },
      { code: '51', nom: 'Ouled Djellal' },
      { code: '52', nom: 'Béni Abbès' },
      { code: '53', nom: 'In Salah' },
      { code: '54', nom: 'In Guezzam' },
      { code: '55', nom: 'Touggourt' },
      { code: '56', nom: 'Djanet' },
      { code: '57', nom: 'El M\'Ghair' },
      { code: '58', nom: 'El Meniaa' }
    ];
  },

  /**
   * Obtenir le nom d'une wilaya à partir de son code
   */
  getWilayaName(code) {
    const wilaya = this.getWilayasList().find(w => w.code === code);
    return wilaya ? wilaya.nom : code;
  },

  /**
   * Obtenir le code d'une wilaya à partir de son nom
   */
  getWilayaCode(nom) {
    const wilaya = this.getWilayasList().find(w => 
      w.nom.toLowerCase() === nom.toLowerCase()
    );
    return wilaya ? wilaya.code : null;
  },

  /**
   * Formatter une wilaya pour affichage
   */
  formatWilaya(wilaya) {
    if (!wilaya) return null;
    return {
      ...wilaya,
      displayName: `${wilaya.code} - ${wilaya.nom}`
    };
  },

  /**
   * Formatter une liste de wilayas pour un select
   */
  formatForSelect() {
    return this.getWilayasList().map(wilaya => ({
      value: wilaya.code,
      label: `${wilaya.code} - ${wilaya.nom}`
    }));
  }
};

export default wilayaService;