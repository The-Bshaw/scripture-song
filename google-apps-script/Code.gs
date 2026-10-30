/**
 * Bind this script to "Songs at The Well" Google Sheet.
 * Script Properties: SYNC_TOKEN = a long randomly-generated private token.
 * Deploy as Web App: Execute as Me; Who has access: Anyone.
 * Only the four active category columns are returned. Never expose other columns.
 */
const ACTIVE_CATEGORIES = ['Global', 'Ancient', 'Heritage', 'Advent'];
const EXCLUDED_TITLES = /^(?:add soon|add to rotation|maybe)$/i;

function doPost(e) {
  try {
    const token = PropertiesService.getScriptProperties().getProperty('SYNC_TOKEN');
    const supplied = JSON.parse(e.postData.contents || '{}').token;
    if (!token || token.length < 24 || !supplied || supplied !== token) {
      return respond_({ok:false, error:'Unauthorized'});
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // The workbook's main music list is arranged in columns A:D.
    // If a tab named Songs at The Well exists, favor it; otherwise use first tab.
    const sheet = ss.getSheetByName('Songs at The Well') || ss.getSheets()[0];
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) throw new Error('Sheet appears empty');
    const range = sheet.getRange(2,1,lastRow-1,4);
    const rich = range.getRichTextValues();
    const formulas = range.getFormulas();
    const values = range.getDisplayValues();
    const songs=[];
    for (let r=0;r<values.length;r++) for(let c=0;c<4;c++){
      const title=(values[r][c] || '').trim();
      if (!title || EXCLUDED_TITLES.test(title)) continue;
      let url = rich[r][c] && rich[r][c].getLinkUrl() || '';
      if (!url && rich[r][c]) {
        const runs = rich[r][c].getRuns();
        if (runs.length === 1) url = runs[0].getLinkUrl() || '';
        else {
          const candidate = runs.map(run => run.getLinkUrl()).filter(Boolean);
          if (candidate.length && candidate.every(x => x === candidate[0])) url=candidate[0];
        }
      }
      if (!url && formulas[r][c]) {
        const match=formulas[r][c].match(/^=HYPERLINK\(\s*"([^"]+)"/i);
        if (match) url=match[1];
      }
      const spotify = url.match(/^https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]{22})(?:[/?#].*)?$/);
      songs.push({title, category:ACTIVE_CATEGORIES[c], spotifyUrl:spotify ? 'https://open.spotify.com/track/'+spotify[1] : ''});
    }
    return respond_({ok:true, schemaVersion:1, songs});
  } catch (err) {
    return respond_({ok:false, error:String(err.message || err)});
  }
}
function respond_(payload){return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);}
