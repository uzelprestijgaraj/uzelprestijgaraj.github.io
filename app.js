const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function araclariYukle() {
  const liste = document.getElementById('aracListesi');
  if (!liste) return;

  const { data, error } = await supabaseClient
    .from('araclar')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    liste.innerHTML = `<p class="yukleniyor">Araçlar yüklenemedi: ${error.message}</p>`;
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    liste.innerHTML = '<p class="yukleniyor">Henüz araç eklenmemiş.</p>';
    return;
  }

  liste.innerHTML = data.map(a => `
    <div class="arac-kart">
      <div class="arac-resim">🚗</div>
      <div class="arac-bilgi">
        <span class="durum-badge ${a.durum}">${durumYazi(a.durum)}</span>
        <h3>${a.marka || ''} ${a.model || ''}</h3>
        <div class="arac-ozellikler">
          <span>📅 ${a.yil || '-'}</span>
          <span>⚙️ ${a.vites || '-'}</span>
          <span>⛽ ${a.yakit || '-'}</span>
        </div>
        <div class="arac-alt">
          <div class="arac-fiyat">${a.gunluk_ucret || 0} TL <small>/gün</small></div>
          <a href="#" class="btn-kirala">Kirala</a>
        </div>
      </div>
    </div>
  `).join('');
}

function durumYazi(d) {
  const map = { musait: 'Müsait', kirada: 'Kirada', yikamada: 'Yıkamada', serviste: 'Serviste' };
  return map[d] || d;
}

function aracAra() {
  const alis = document.getElementById('alisTarih').value;
  const donus = document.getElementById('donusTarih').value;
  if (!alis || !donus) {
    alert('Lütfen alış ve dönüş tarihlerini seçin.');
    return;
  }
  document.getElementById('araclar').scrollIntoView({ behavior: 'smooth' });
}

araclariYukle();
