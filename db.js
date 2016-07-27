/*jshint esversion: 6 */

const {Ci, Cu} = require("chrome");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "Task",
  "resource://gre/modules/Task.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "PlacesUtils",
  "resource://gre/modules/PlacesUtils.jsm");

const browsingHistory = `SELECT a.visit_date AS last_visited,
                                b.url, b.title, b.visit_count,
                                b.last_visit_date FROM moz_historyvisits a
                                JOIN moz_places b ON a.id = b.id`;

const recentHistory = `SELECT a.visit_date AS last_visited,
                              b.url, b.title, b.visit_count,
                              b.last_visit_date FROM moz_historyvisits a
                              JOIN moz_places b ON a.id = b.id
                              WHERE datetime(b.last_visit_date / 1000 / 1000, 'unixepoch') > datetime('now', '-3 day')`;

function executeQuery(aSql, aOptions = {}) {
  let {columns, params, callback} = aOptions;
  let items = [];
  let queryError = null;
  return Task.spawn(function*() {
    let conn = yield PlacesUtils.promiseDBConnection();
    yield conn.executeCached(aSql, params, aRow => {
      try {
        // check if caller wants to handle query raws
        if (callback) {
          callback(aRow);
        }
        // otherwise fill in the item and add items array
        else {
          let item = null;
          // if columns array is given construct an object
          if (columns && Array.isArray(columns)) {
            item = {};
            columns.forEach(column => {
              item[column] = aRow.getResultByName(column);
            });
          } else {
            // if no columns - make an array of raw values
            item = [];
            for (let i = 0; i < aRow.numEntries; i++) {
              item.push(aRow.getResultByIndex(i));
            }
          }
          items.push(item);
        }
      } catch (e) {
        console.log(e);
        queryError = e;
        throw StopIteration;
      }
    });
    if (queryError) {
      console.log(e);
      throw new Error(queryError);
    }
    return items;
  });
}

exports.allHistory = () => {
  return executeQuery(browsingHistory);
};
exports.recentHistory = () => {
  return executeQuery(recentHistory);
};
