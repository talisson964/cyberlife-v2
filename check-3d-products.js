// Script para verificar produtos 3D no banco
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project-url.supabase.co'  // Substitua pela URL real
const supabaseKey = 'your-anon-key'  // Substitua pela chave real

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProducts3D() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, model_3d, category')
      .eq('category', 'geek')
      .not('model_3d', 'is', null);

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return;
    }

    console.log('Produtos com model_3d encontrados:', products?.length || 0);
    products?.forEach(product => {
      console.log(`- ${product.name}: ${product.model_3d}`);
    });

  } catch (error) {
    console.error('Erro de conexão:', error);
  }
}

checkProducts3D();