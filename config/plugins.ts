export default () => ({
  documentation: {
    enabled: true,
    config: {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'DOCUMENTATION ADALA',
        description: 'API pour le projet Adala - Accès au droit au Tchad',
        termsOfService: '',
        contact: {
          name: 'Adala Team',
          email: 'contact@adala.td',
          url: 'https://adala.td'
        },
        license: {
          name: 'Apache 2.0',
          url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
        },
      },
    },
  },
});