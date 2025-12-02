/**
 * disposition controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::disposition.disposition', ({ strapi }) => ({
  async find(ctx) {
    const { query } = ctx.request;
    
    // Si on a des filtres avec $containsi sur content ou title, on doit gérer différemment
    // car content est de type 'blocks' et on veut une recherche par mots-clés OR
    if (query.filters) {
      const filters: any = query.filters;
      
      // Extraire la recherche textuelle s'il y en a une
      let textSearch = null;
      if (filters.$and) {
        const orCondition = filters.$and.find((condition: any) => condition.$or);
        if (orCondition?.$or) {
          // Chercher dans title ou content
          const titleSearch = orCondition.$or.find((c: any) => c.title?.$containsi);
          const contentSearch = orCondition.$or.find((c: any) => c.content?.$containsi);
          
          if (titleSearch) {
            textSearch = titleSearch.title.$containsi;
          } else if (contentSearch) {
            textSearch = contentSearch.content.$containsi;
          }
        }
      }
      
      if (textSearch) {
        // Normaliser et extraire les mots-clés
        const keywords = textSearch
          .toLowerCase()
          .replace(/[,;.!?]/g, ' ') // Remplacer ponctuation par espaces
          .split(/\s+/) // Séparer par espaces
          .filter((word: string) => word.length > 0) // Enlever les mots vides
          .filter((word: string) => word.length >= 2); // Enlever mots trop courts
        
        console.log('[SEARCH] Text search detected:', textSearch);
        console.log('[SEARCH] Keywords extracted:', keywords);
        
        if (keywords.length === 0) {
          return {
            data: [],
            meta: {
              pagination: {
                page: 1,
                pageSize: 25,
                pageCount: 0,
                total: 0
              }
            }
          };
        }
        
        // Récupérer toutes les dispositions avec les autres filtres (sans title/content search)
        const modifiedFilters = JSON.parse(JSON.stringify(filters));
        
        // Retirer complètement le $or qui contient title/content search
        if (modifiedFilters.$and) {
          modifiedFilters.$and = modifiedFilters.$and.filter((condition: any) => {
            // Garder seulement les conditions qui ne sont pas des recherches textuelles
            if (condition.$or) {
              const hasTextSearch = condition.$or.some((c: any) => 
                c.title?.$containsi || c.content?.$containsi
              );
              return !hasTextSearch;
            }
            return true;
          });
          
          // Si $and est vide, le supprimer
          if (modifiedFilters.$and.length === 0) {
            delete modifiedFilters.$and;
          }
        }
        
        // Stratégie optimisée: Recherche par titre d'abord (rapide)
        // puis complément avec recherche dans le contenu si nécessaire
        const originalPagination: any = query.pagination;
        const requestedPageSize = originalPagination?.pageSize || 25;
        const requestedPage = originalPagination?.page || 1;
        
        // Créer un filtre OR sur les titres pour tous les mots-clés
        const titleOrFilters = keywords.map(keyword => ({
          title: { $containsi: keyword }
        }));
        
        const searchFilters = {
          ...modifiedFilters,
          ...(modifiedFilters.$and ? {} : { $and: [] })
        };
        
        if (!searchFilters.$and) searchFilters.$and = [];
        searchFilters.$and.push({ $or: titleOrFilters });
        
        // Recherche optimisée: récupérer un grand échantillon (3x la taille demandée)
        // pour avoir assez de résultats après filtrage du contenu
        query.filters = searchFilters;
        query.pagination = { limit: requestedPageSize * 3 };
        
        const { results } = await strapi.service('api::disposition.disposition').find(query);
        
        console.log('[SEARCH] Total results from DB (title search):', results.length);
        
        // Fonction pour extraire tout le texte d'une disposition
        const extractText = (disposition: any): string => {
          let text = disposition.title || '';
          
          // Extraire le texte des blocs
          if (disposition.content && Array.isArray(disposition.content)) {
            disposition.content.forEach((block: any) => {
              if (block.children && Array.isArray(block.children)) {
                block.children.forEach((child: any) => {
                  if (child.text) {
                    text += ' ' + child.text;
                  }
                });
              }
            });
          }
          
          return text.toLowerCase();
        };
        
        // Filtrer et scorer les résultats
        const scoredResults = results.map((disposition: any) => {
          const text = extractText(disposition);
          
          // Compter combien de mots-clés sont trouvés
          let score = 0;
          const foundKeywords: string[] = [];
          
          keywords.forEach((keyword: string) => {
            if (text.includes(keyword)) {
              score++;
              foundKeywords.push(keyword);
              
              // Bonus si trouvé dans le titre
              if (disposition.title?.toLowerCase().includes(keyword)) {
                score += 2; // Le titre compte plus
              }
            }
          });
          
          return {
            ...disposition,
            _score: score,
            _foundKeywords: foundKeywords
          };
        });
        
        // Filtrer ceux qui ont au moins un mot-clé (OR logic)
        const filtered = scoredResults.filter((item: any) => item._score > 0);
        
        console.log('[SEARCH] Total results before filtering:', results.length);
        console.log('[SEARCH] Results after keyword filtering:', filtered.length);
        
        // Trier par score décroissant (pertinence)
        filtered.sort((a: any, b: any) => b._score - a._score);
        
        // Recalculer la pagination
        const total = filtered.length;
        const start = (requestedPage - 1) * requestedPageSize;
        const paginatedResults = filtered.slice(start, start + requestedPageSize);
        
        return {
          data: paginatedResults,
          meta: {
            pagination: {
              page: requestedPage,
              pageSize: requestedPageSize,
              pageCount: Math.ceil(total / requestedPageSize),
              total
            }
          }
        };
      }
    }
    
    // Utiliser le comportement par défaut
    return await super.find(ctx);
  }
}));
