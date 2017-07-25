app.service('$swiperFactory',['$http', '$rootScope', '$localStorage', function($http, $rootScope, $localStorage) {

  // Beginning of swipers
  var roundToByte = function(length) {
    if(length % 8 == 0){
      return length;
    }
    return length + (8-(length % 8));
  };

  var baseSwiper = function(){
    this.showManual = false;
    this.parseRawSwipe = function(rawSwipe) {
      var result = {
        isSuccessful: false,
        message: 'Failed to swipe. Please try again.',
        accountKey: '',
        encryptedAccount: ''
      };

      //todo: parse raw swipe details
      var raw = rawSwipe;
      var stx = raw.substr(0,2);
      var lowByteTotal = raw.substr(2,2);
      var highByteTotal = raw.substr(4,2);
      var cardType = raw.substr(6,2);
      var isTrackGood = raw.substr(8,2);
      var track1Length = raw.substr(10,2);
      var track2Length = raw.substr(12,2);
      var track3Length = raw.substr(14,2);
      var featureMask = raw.substr(16,2);
      var hashStatusMask = raw.substr(18,2);
      var track1 = '';
      var track2 = '';
      var track3 = '';
      var encTrk1 = '';
      var encTrk2 = '';
      var encTrk3 = '';
      track1Length = parseInt("0X"+track1Length, 16);
      track2Length = parseInt("0X"+track2Length, 16);
      track3Length = parseInt("0X"+track3Length, 16);

      var encTrk1Length = roundToByte(track1Length)*2;
      var encTrk2Length = roundToByte(track2Length)*2;
      var encTrk3Length = roundToByte(track3Length)*2;

      featureMask = parseInt("0X"+featureMask, 16);
      hashStatusMask = parseInt("0X"+hashStatusMask, 16);

      if (isNaN(track1Length)
      || isNaN(track2Length)
      || isNaN(track3Length)
      || isNaN(featureMask)
      || isNaN(hashStatusMask)){
          result.message = 'Error reading card. please swipe again.';
          return result;
      }

      var featureBits = featureMask.toString(2); // bits as char array!
      var hashBits = hashStatusMask.toString(2);

      var start = 20;
      track1 = raw.substr(start, track1Length);
      start += track1Length;
      track2 = raw.substr(start, track2Length);
      start += track2Length;
      track3 = raw.substr(start, track3Length);
      if(hashBits[0] == "1"){ //hashbits[0] == KSN included?
        start += track3Length;
        encTrk1 = raw.substr(start, encTrk1Length);
        start += encTrk1Length;
        encTrk2 = raw.substr(start, encTrk2Length);
        start += encTrk2Length;
        encTrk3 = raw.substr(start, encTrk3);
        result.isSuccessful = true;
        result.accountKey = raw.substr(raw.length-26,20);
        result.encryptedAccount = encTrk2;
      }

      var account = track2.substr(0, track2.indexOf("?"));
      if(track2.indexOf("=") != -1){
        account = track2.substr(0, track2.indexOf("="));
      }
      account = account.replace(";", "");
      if (account == ''){
        result.swipeMessage = "Failed to read the card correctly. Please try agian.";
        return result;
      }
      result.isSuccessful = true;
      result.account = account;
      return result;
    };
  };
  var secuRedKeyboard = new baseSwiper();
  secuRedKeyboard.display = 'SecuRed + Keypad';

  var secureRed = new baseSwiper();
  secureRed.display = "SecuRed";
  secureRed.showManual = true;

  var swipers = {
    'SecuRed-Keypad': secuRedKeyboard,
    'SecuRed': secureRed
  };
  // END OF SWIPERS
  this.getSwiper = function(selectedSwiper){
    selectedSwiper = selectedSwiper || $localStorage.config().selectedSwiper;
    if(!selectedSwiper || selectedSwiper == 'None'){
      return null;
    }

    return swipers[selectedSwiper];
  };

  this.getListOfSwipers = function() {
    return Object.getOwnPropertyNames(swipers).map(function(key){
      return { display: swipers[key].display, value: key};
    });
  };

}]);
