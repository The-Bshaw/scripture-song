/**
 * Bind this script to "Songs at The Well" Google Sheet.
 * Script Properties: SYNC_TOKEN = a long randomly-generated private token.
 * Deploy as Web App: Execute as Me; Who has access: Anyone.
 * Four active categories plus the Shelved (column F) list are returned. Column E is not published.
 */
const SHEET_CATEGORIES = {0:'Global', 1:'Ancient', 2:'Heritage', 3:'Advent', 5:'Shelved'};
const EXCLUDED_TITLES = /(?:^|[\s–-]+)(?:add soon|add to rotation|maybe)$/i;

function doPost(e) {
  try {
    const token = PropertiesService.getScriptProperties().getProperty('SYNC_TOKEN');
    const supplied = JSON.parse(e.postData.contents || '{}').token;
    if (!token || token.length < 24 || !supplied || supplied !== token) {
      return respond_({ok:false, error:'Unauthorized'});
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // The workbook uses A:D for active groups and F for Shelved; E is excluded.
    // If a tab named Songs at The Well exists, favor it; otherwise use first tab.
    const sheet = ss.getSheetByName('Songs at The Well') || ss.getSheets()[0];
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) throw new Error('Sheet appears empty');
    const range = sheet.getRange(2,1,lastRow-1,6);
    const rich = range.getRichTextValues();
    const formulas = range.getFormulas();
    const values = range.getDisplayValues();
    const songs=[];
    for (let r=0;r<values.length;r++) for(let c=0;c<6;c++){
      if (!Object.prototype.hasOwnProperty.call(SHEET_CATEGORIES,c)) continue;
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
      songs.push({title, category:SHEET_CATEGORIES[c], spotifyUrl:spotify ? 'https://open.spotify.com/track/'+spotify[1] : ''});
    }
    return respond_({ok:true, schemaVersion:1, songs});
  } catch (err) {
    return respond_({ok:false, error:String(err.message || err)});
  }
}
function respond_(payload){return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);}
