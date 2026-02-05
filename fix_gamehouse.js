const fs = require('fs');
const path = 'src/screens/GameHouse.jsx';

try {
    let content = fs.readFileSync(path, 'utf8');

    // Marcador de inicio do lixo (após a nova section Galeria)
    // A nova section termina com </section>, mas temos que ter cuidado para não pegar outro section.
    // Sabemos que logo após vem o lixo.
    // O lixo que sobrou começa com "  {/* Carrossel de Jogos" (porque deletei o header).
    // Mas pode ter linhas em branco antes.
    // Vamos procurar pelo FIM da nova section Galeria.
    // Ela contém "Seção Loja Geek (Antiga Explore Jogos) - Agora visível sempre".

    const newSectionMarker = "{/* Seção Loja Geek (Antiga Explore Jogos) - Agora visível sempre */ }";
    const startIdx = content.indexOf(newSectionMarker);

    if (startIdx === -1) {
        console.error("Não encontrou o início da nova section!");
        process.exit(1);
    }

    // Achar o fechamento dessa section.
    // Podemos procurar "</section>" a partir de startIdx.
    const sectionEndTag = "</section>";
    const endOfNewSectionIdx = content.indexOf(sectionEndTag, startIdx);

    if (endOfNewSectionIdx === -1) {
        console.error("Não encontrou o fechamento da nova section!");
        process.exit(1);
    }

    const cutStart = endOfNewSectionIdx + sectionEndTag.length;

    // Marcador de fim do lixo (início da section download app)
    const downloadSectionMarker = "{/* Nova seção para download do app";
    const cutEnd = content.indexOf(downloadSectionMarker);

    if (cutEnd === -1) {
        console.error("Não encontrou o início da section Download App!");
        process.exit(1);
    }

    console.log(`Cortando de ${cutStart} até ${cutEnd} (${cutEnd - cutStart} caracteres)`);

    const newContent = content.slice(0, cutStart) + "\n\n" + content.slice(cutEnd);

    fs.writeFileSync(path, newContent);
    console.log("Arquivo corrigido com sucesso!");

} catch (e) {
    console.error("Erro:", e);
}
