// ═══════════════════════════════════════════════════════════════════════
// Google Apps Script — BKD NIP Search API
// ═══════════════════════════════════════════════════════════════════════
//
// CARA DEPLOY:
// 1. Buka Google Spreadsheet Anda
// 2. Klik menu Extensions > Apps Script
// 3. Hapus semua kode yang ada, lalu paste kode di bawah ini
// 4. Ganti 'GANTI_DENGAN_SPREADSHEET_ID' dengan ID spreadsheet Anda
//    (ID ada di URL spreadsheet: https://docs.google.com/spreadsheets/d/ID_ADA_DI_SINI/edit)
// 5. Klik Deploy > New deployment
// 6. Pilih type: Web app
// 7. Set "Execute as" = Me
// 8. Set "Who has access" = Anyone
// 9. Klik Deploy dan copy URL-nya
// 10. Paste URL tersebut ke index.html (ganti GANTI_DENGAN_URL_APPS_SCRIPT_ANDA)
//
// FORMAT SPREADSHEET:
// Baris 1 (Header): NIP | Nama | Pangkat/Golongan | Jabatan | Unit Kerja | Status
// Baris 2+: Data pegawai
//
// ═══════════════════════════════════════════════════════════════════════

function doGet(e) {
  try {
    var nip = e.parameter.nip;
    
    if (!nip) {
      return createResponse({ found: false, error: 'Parameter NIP diperlukan.' });
    }

    // ─── GANTI ID SPREADSHEET DI BAWAH ───
    var spreadsheetId = 'GANTI_DENGAN_SPREADSHEET_ID';
    
    var sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    // Cari NIP. Pada spreadsheet, cell NIP mungkin berisi spasi, enter, atau sisa karakter
    for (var i = 1; i < data.length; i++) {
        // Membersihkan NIP dari spreadsheet (buang enter/spasi ekstra)
        var cellNip = String(data[i][1] || '').replace(/\s+/g, '').trim();
        var searchNip = String(nip || '').replace(/\s+/g, '').trim();
        
        if (cellNip === searchNip && cellNip !== "") {
          
          // Memetakan secara spesifik sesuai kolom di gambar spreadsheet
          // Index 0: No
          // Index 1: Nip
          // Index 2: Nama
          // Index 3: Jabatan
          // Index 4: Instansi
          // Index 5: Jenjang Studi
          // Index 6: Program Studi...
          // Index 7: TAHUN... (Asumsi, tak terlihat jelas)
          // Index 8: STATUS USULAN
          
          var result = {
            "NIP": cellNip,
            "Nama": String(data[i][2] || '').trim(), 
            "Jabatan": String(data[i][3] || '').trim(), 
            "Unit Kerja": String(data[i][4] || '').trim(), 
            "Pangkat/Golongan": String(data[i][6] || '').trim() || '-', // Diambil dari Program Studi
            "Status": String(data[i][7] || '').trim() // STATUS USULAN (index 7, Kolom H)
          };
          
          return createResponse({ found: true, data: result });
        }
    }

    // Tidak ditemukan
    return createResponse({ found: false });

  } catch (error) {
    console.error(error);
    return createResponse({ found: false, error: error.message });
  }
}

function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
