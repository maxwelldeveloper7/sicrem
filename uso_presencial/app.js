// Lista de critérios e pontos
const CRITERIA = [
  { id: 'c1', text: 'I - Crianças afastadas do convívio familiar', pts: 20 },
  { id: 'c2', text: 'II - Crianças encaminhadas por órgãos de proteção', pts: 15 },
  { id: 'c3', text: 'III - Crianças com registro civil incompleto', pts: 13 },
  { id: 'c4', text: 'IV - Mães matriculadas na rede pública de ensino', pts: 10 },
  { id: 'c5', text: 'V - Mães com vínculo empregatício', pts: 10 },
  { id: 'c6', text: 'VI - Residência em comunidade vulnerável', pts: 8 },
  { id: 'c7', text: 'VII - Famílias com menor renda per capita', pts: 8 },
  { id: 'c8', text: 'VIII - Benefício – Bolsa Família / DCB', pts: 6 },
  { id: 'c9', text: 'IX - Benefício LOAS/BPC ou seguro desemprego', pts: 5 },
  { id: 'c10', text: 'X - Pais trabalham próximos da unidade', pts: 5 }
];

// Renderiza checkboxes
const listEl = document.getElementById('criteriaList');
CRITERIA.forEach(c => {
  const wrap = document.createElement('div'); wrap.className = 'crit';
  const cb = document.createElement('input'); cb.type = 'checkbox'; cb.id = c.id; cb.dataset.pts = c.pts;
  const label = document.createElement('label'); label.htmlFor = c.id; label.innerText = c.text;
  const pts = document.createElement('div'); pts.className = 'points'; pts.innerText = c.pts + ' pts';
  wrap.append(cb, label, pts);
  listEl.appendChild(wrap);
});

// Atualiza soma
function updateTotal() {
  const checked = [...document.querySelectorAll('#criteriaList input:checked')];
  const total = checked.reduce((s, el) => s + Number(el.dataset.pts), 0);
  document.getElementById('totalPoints').innerText = total;
  document.getElementById('composition').innerText =
    checked.length
      ? checked.map(el => `${el.id.toUpperCase()}(${el.dataset.pts})`).join(' + ') + ' = ' + total + ' pts'
      : 'Nenhum critério selecionado';
}
document.querySelectorAll('#criteriaList input').forEach(cb => cb.addEventListener('change', updateTotal));

// Cálculo renda per capita
document.getElementById('calcPerCapita').addEventListener('click', () => {
  const income = parseFloat(document.getElementById('familyIncome').value) || 0;
  const members = parseInt(document.getElementById('familyMembers').value) || 1;
  const salaryMin = parseFloat(document.getElementById('salaryMin').value) || 0;
  const percap = income / members;
  const half = salaryMin / 2;
  document.getElementById('percapValue').innerText = percap.toFixed(2).replace('.', ',');
  document.getElementById('halfSalary').innerText = 'R$ ' + half.toFixed(2).replace('.', ',');
  const statusEl = document.getElementById('percapStatus');
  document.getElementById('c7').checked = percap <= half;
  updateTotal();
  statusEl.innerHTML =
    percap <= half
      ? '<strong style="color:var(--success)">Dentro do corte: recebe 8 pontos</strong>'
      : '<strong style="color:#c2410c">Acima do corte: não recebe 8 pontos</strong>';
  document.getElementById('percapResult').style.display = 'block';
});
document.getElementById('clearPerCapita').addEventListener('click', () => {
  document.getElementById('familyIncome').value = 0;
  document.getElementById('familyMembers').value = 1;
  document.getElementById('salaryMin').value = 1621;
  document.getElementById('percapResult').style.display = 'none';
  document.getElementById('c7').checked = false;
  updateTotal();
});

// Corte etário
function calcAgeOnCutoff(dobStr, cutoffStr = '2027-03-31') {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  const cutoff = new Date(cutoffStr);
  let age = cutoff.getFullYear() - dob.getFullYear();
  const mDiff = cutoff.getMonth() - dob.getMonth();
  if (mDiff < 0 || (mDiff === 0 && cutoff.getDate() < dob.getDate())) age--;
  return age;
}
function mapAgeToOutcome(age) {
  if (age === 10) return "5º Ano do Ensino Fundamental";
  if (age === 9) return "4º Ano do Ensino Fundamental";
  if (age === 8) return "3º Ano do Ensino Fundamental";
  if (age === 7) return "2º Ano do Ensino Fundamental";
  if (age === 6) return "1º Ano do Ensino Fundamental";
  if (age === 5) return "Pré-escola (5 anos)";
  if (age === 4) return "Pré-escola (4 anos)";
  if (age === 3) return "Educação Infantil (Berçário III)";
  if (age === 2) return "Educação Infantil (Berçário II)";
  if (age > -1 && age <= 1) return "Educação Infantil (Berçário I)";
  return "Idade não elegível para séries convencionais";
}
document.getElementById('calcAge').addEventListener('click', () => {
  const dob = document.getElementById('dob').value;
  const age = calcAgeOnCutoff(dob);
  if (age === null) { alert('Informe uma data válida'); return; }
  let ageSuffix = ' anos'
  if (age < 2) {
    ageSuffix = ' ano'
  }
  document.getElementById('ageValue').innerText = age + ageSuffix;
  document.getElementById('ageOutcome').innerText = mapAgeToOutcome(age);
  document.getElementById('ageResult').style.display = 'block';
});
document.getElementById('clearAge').addEventListener('click', () => {
  document.getElementById('dob').value = '';
  document.getElementById('ageResult').style.display = 'none';
});

document.getElementById('clearData').addEventListener('click', () => {
  for (let index = 1; index <= 10; index++) {
    document.getElementById(`c${index}`).checked = false;
  }
  document.getElementById('familyIncome').value = 0;
  document.getElementById('familyMembers').value = 1;
  document.getElementById('salaryMin').value = 1621;
  document.getElementById('percapResult').style.display = 'none';
  document.getElementById('dob').value = '';
  document.getElementById('ageResult').style.display = 'none';
  updateTotal();
});

// inicializa total
updateTotal();
