
var HangarXPLOR = HangarXPLOR || {};

HangarXPLOR.BulkEnabled = true;

HangarXPLOR._callbacks = HangarXPLOR._callbacks || {};

HangarXPLOR._callbacks.Gift = function(e) { window.alert('Coming Soon') }

HangarXPLOR._callbacks.GiftConfirm = function(e) { window.alert('Coming Soon') }

HangarXPLOR._callbacks.Melt = function(e) { 
  e.preventDefault();
  window.Main.closeModal();
  
  var data = {
    item_price: '$' + HangarXPLOR._selectedMelt.toLocaleString('en-US', {minimumFractionDigits: 2}),
    item_name: HangarXPLOR._meltable.length + ' Ships',
    items: HangarXPLOR._meltable,
  };
  
  HangarXPLOR.BulkUI.modal = new RSI.Lightbox({
    content: window.Main.renderTemplate("#tpl_reclaim_bulk", data),
    class_name: 'modals',
    noclose_btn: true
  });
  
  HangarXPLOR.BulkUI.modal.holder.find(".panes").css({ left: '-535px' });
  
  $(document).on('submit', 'form[name=reclaim-bulk]', HangarXPLOR._callbacks.MeltConfirm);
  
  HangarXPLOR.BulkUI.modal.fadeIn(300);
}

HangarXPLOR._callbacks.MeltConfirm = function(e) {
  e.preventDefault();
  var totalCallbacks = 0;
  var totalSuccess = 0;
  var totalMelt = 0;
  var errors = '';
  
  $(HangarXPLOR._selected).each(function() {
    totalCallbacks++;
    var pledge = this;
    $.ajax({
      url: '/api/account/reclaimPledge',
      method: 'POST',
      data: {
        current_password: hex_md5($('input[name=current_password]', HangarXPLOR.BulkUI.modal.holder).val()),
        pledge_id: pledge.pledgeId
      }, 
      headers: { 'X-Rsi-Token': $.cookie('Rsi-Token') },
      success: function(result) {
        if (result.success)
        {
          totalSuccess++;
          totalMelt += pledge.meltValue;
        } else {
          errors += '<li>' + result.msg + '</li>';
        }
        
        if (--totalCallbacks <= 0) {
          if (totalSuccess > 0) {
            $('#reclaim .panes').hide();
            $('#reclaim .js-error-message').hide();
            $('#reclaim .js-success-message').html("Your Store ledger was credited with <strong>$" + totalMelt.toLocaleString('en-US', {minimumFractionDigits: 2}) + "</strong>").fadeIn(300);
            setTimeout(function() { document.location.reload() }, 5000);
            HangarXPLOR.BulkUI.modal.resizeCurrent();
          } else {
            $('#reclaim .panes').hide();
            $('#reclaim .js-error-message').html('There were errors completing your request. <ul>' + errors + '</ul>').fadeIn(300);
            setTimeout(function() { document.location.reload() }, 5000);
            HangarXPLOR.BulkUI.modal.resizeCurrent();
          }
        }
      }
    });
  });
}
