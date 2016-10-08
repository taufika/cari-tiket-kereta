// init Namespace
var MyNamespace = MyNamespace || {};

// module namespace
MyNamespace.UIComponents = function( customSetting ) {

	// overwrite default settings
	var settings = $.extend( {
		tablet : false,
		mobile : false,
	}, 
	customSetting || {});

	// vars
	var self = this;

	// check tablet
	if( $( window ).width() <= 1024 ) {

		// mobile view
		settings.tablet = true;
	}

	// check mobile
	if( $( window ).width() <= 767 ) {

		// mobile view
		settings.mobile = true;
	}

	// PROTOTYPE
	// text limiter prototype
	$.fn.textLimiter = function( options ) {

		// var
		var localvar = $.extend({
			selector : this,
			textLength : 100
		}, options || {});

		// text
		var txt = $( localvar.selector ).text();
		txt = txt.trim();

		// limit text replace with '...'
		if ( txt.length > localvar.textLength ) {

			$( localvar.selector ).text( txt.substring( 0 , options.textLength ) + '...' );

		}

		// chain
		return this;
	}

	// array sorter
	Array.prototype.sortOn = function(key){
		this.sort(function(a, b){
			if(a[key] < b[key]){
				return -1;
			}else if(a[key] > b[key]){
				return 1;
			}
			return 0;
		});
	}

	this.init = function() {

		initFirebase();

		initMakeImageCover();

		// init jquery UI
		initJqueryUI();

		// init main form
		initMainForm();

		// init reset search
		initResetSearch();

		// init options
		initOptions();

		// init filter box
		initFilterBox();
	}

	// method to load firebase API
	var initFirebase = function(){

		var config = {
			apiKey: "AIzaSyDzwbCWu4-wxcVRezuFB8omsjsP1UQUAHA",
			authDomain: "cari-tiket-kereta.firebaseapp.com",
			databaseURL: "https://cari-tiket-kereta.firebaseio.com",
			storageBucket: "cari-tiket-kereta.appspot.com",
			messagingSenderId: "778229359539"
		};

		firebase.initializeApp(config);
	}

	var initMakeImageCover = function() {

		// check
		if( $('.img-wrap').length ) {
			console.log('asu');
			$(' .img-wrap > img ').each( function() {
				var img = this;
				$('<img/>').attr('src', $(img).attr('src')).load(function() {
					if (this.width < this.height) {
						$(img).addClass('portrait');
					}
				});
			});
		}
	}

	// method to init Jquery UI
	var initJqueryUI = function(){

		// init datepicker
		if( $(" input.tanggal ").length ){

			$(" input.tanggal ").datepicker({ minDate: 1, maxDate: "+3M" });
			$(" input.tanggal ").datepicker("option", "dateFormat","yy-mm-dd");
		}
	}

	// method to process main form
	var initMainForm = function(){

		// add listener
		$(" form.main ").submit(function(event){

			// check if valid
			if( this.checkValidity() ){

				if( $(" #asal ").val() != $(" #tujuan ").val() ){

					$(" .loading-screen ").hide();
					$(" .no-ticket ").hide();

					// scroll to the section
					$(" main ").animate({
						scrollTop: $(" main ").scrollTop() + $(" section.list ").offset().top,
					}, 1000, "swing", function(){

						// show loading screen
						$(" .loading-screen ").fadeIn(300);
						$(" main ").css("overflow","hidden");
					});

					// fill data
					//=====================================

					// changing header
					$(" #label-asal ").html( $(" #asal ").val() );
					$(" #label-tujuan ").html( $(" #tujuan ").val() );
					$(" #label-kelas ").html( $(" #kelas ").val() );
					$(" #label-penumpang ").html( $(" #penumpang ").val() );

					// show only appropriate class
					$(" .class-box ").removeClass(" eksekutif bisnis ekonomi ");
					if( $(" #kelas ").val() == "Apapun" ){

						$(" .class-box ").addClass(" eksekutif bisnis ekonomi ");
					} else {
						$(" .class-box ").addClass( $(" #kelas ").val().toLowerCase() );
					}

					// reverse date format
					var tanggal = $(" #tanggal ").val().split("-");
					var bulan = function(angka){

						switch(angka){
							case "01": return "Januari";
							case "02": return "Februari";
							case "03": return "Maret";
							case "04": return "April";
							case "05": return "Mei";
							case "06": return "Juni";
							case "07": return "Juli";
							case "08": return "Agustus";
							case "09": return "September";
							case "10": return "Oktober";
							case "11": return "November";
							case "12": return "Desember";
						}
					}

					$(" #label-tanggal ").html( tanggal[2] + " " + bulan( tanggal[1] ) + " " + tanggal[0] );

					var stasiun = {asal:[], tujuan:[], kereta:[], asal_long:[], tujuan_long:[] };
					var classID = {};

					// load filter header
					$(" .stasiun.keberangkatan .judul ").html($(" #asal ").val());
					$(" .stasiun.kedatangan .judul ").html($(" #tujuan ").val());
					$(" .stasiun .list ").html("");

					// load stasiun asal
					firebase.database().ref("/stasiun/" + $(" #asal ").val().toLowerCase() ).once("value").then(function(snapshot){

						var hasil = snapshot.val();

						for(var i = 0; i < hasil.length; i++){
							stasiun.asal.push( hasil[i].split("#")[0] );
							stasiun.asal_long.push( hasil[i].split("#")[1] );

							var str = '<div class="form-group">\
										<input type="checkbox" id="' + hasil[i].split("#")[0] + '" class="stas" checked>\
										<label for="' + hasil[i].split("#")[0] + '"> \
											<div class="checkbox">\
											<div class="inside"></div>\
											</div>&ensp;' + hasil[i].split("#")[1] + '\
										</label>\
										</div>';
							$(" .stasiun.keberangkatan .list ").append(str);
							
						}
						console.log("Retrieving stasiun keberangkatan berhasil");

						// load stasiun tujuan
						firebase.database().ref("/stasiun/" + $(" #tujuan ").val().toLowerCase() ).once("value").then(function(snapshot){

							var hasil = snapshot.val();

							for(var i = 0; i < hasil.length; i++){
								stasiun.tujuan.push( hasil[i].split("#")[0] );
								stasiun.tujuan_long.push( hasil[i].split("#")[1] );

								var str = '<div class="form-group">\
											<input type="checkbox" id="' + hasil[i].split("#")[0] + '" class="stas" checked>\
											<label for="' + hasil[i].split("#")[0] + '"> \
												<div class="checkbox">\
												<div class="inside"></div>\
												</div>&ensp;' + hasil[i].split("#")[1] + '\
											</label>\
											</div>';
								$(" .stasiun.kedatangan .list ").append(str);
							}

							console.log("Retrieving stasiun kedatangan berhasil");
							var daftarKereta = [];

							// reset cards
							$(" .jadwal ").html("");

							// add loading waiting counter
							var loading = {counter: 0};
							var loader = setInterval(function(){

								// console.log(loading.counter);
								if( $(" .loading h3 ").text() != "Loading ..." )
									$(" .loading h3 ").append(".");
								else
									$(" .loading h3 ").html("Loading ");
								
								if (loading.counter == 0){

									clearInterval(loader);
									$(" .loading-screen ").fadeOut(300, function(){

										// load daftar kereta
										daftarKereta.sort(function(a, b){
											if(parseInt(a["harga"].split("IDR ")[1].replace(".","")) < parseInt(b["harga"].split("IDR ")[1].replace(".",""))){
												return -1;
											}else if(parseInt(a["harga"].split("IDR ")[1].replace(".","")) > parseInt(b["harga"].split("IDR ")[1].replace(".",""))){
												return 1;
											}
											return 0;
										});
										
										for(var iter = 0; iter < daftarKereta.length; iter++){

											var str = '<div class="card ' + daftarKereta[iter].stasiunBerangkatShort + ' ' + daftarKereta[iter].stasiunKedatanganShort + '">\
														<div class="rute"><span class="asal">' + daftarKereta[iter].stasiunBerangkat + '</span> - <span class="tujuan">' + daftarKereta[iter].stasiunKedatangan + '</span>&emsp;<span class="subclass">' + daftarKereta[iter].subClass + '</span></div>\
														<div class="detail">\
														<div class="nama-kereta">' + daftarKereta[iter].nama + '</div>\
														<div class="berangkat">\
															<div class="head">' + daftarKereta[iter].stasiunBerangkat + '</div>\
															<div class="foot">' + daftarKereta[iter].waktuBerangkat + '</div>\
														</div>\
														<div class="strip">Sampai</div>\
														<div class="sampai">\
															<div class="head">' + daftarKereta[iter].stasiunKedatangan + '</div>\
															<div class="foot">' + daftarKereta[iter].waktuKedatangan + '</div>\
														</div>\
														<div class="durasi">( <span class="durasi">' + daftarKereta[iter].durasi + '</span> )</div>\
														<div class="harga">' + daftarKereta[iter].harga + '</div>\
														<div class="beli"><a href="' + daftarKereta[iter].link + '" target="_blank" class="button accent">Beli via Tiket.com</a></div>\
														</div>';

											$(" .box." + daftarKereta[iter].kelas.toLowerCase() + " .jadwal ").append(str);
										}


										// enable scrollbar
										$(" main ").css("overflow","auto");

										// if no ticket
										if( ($(" .box.eksekutif .jadwal ").is(" :hidden ") || $(" .box.eksekutif .jadwal ").html() == "") &&
										 	($(" .box.bisnis .jadwal ").is(" :hidden ") || $(" .box.bisnis .jadwal ").html() == "") &&
										  	($(" .box.ekonomi .jadwal ").is(" :hidden ") || $(" .box.ekonomi .jadwal ").html() == "") ){

											$(" .no-ticket ").fadeIn(500);
										}
									});
								}
									
							}, 500);

							// iterate all station
							for(var i = 0; i < stasiun.asal.length; i++){

								var asal = stasiun.asal[i];

								for(var j = 0; j < stasiun.tujuan.length; j++){

									// increment counter
									loading.counter++;

									var tujuan = stasiun.tujuan[j];
									var theUrl = "http://www.tiket.com/kereta-api/cari?d=" + asal + "&a=" + tujuan + "&date=" + $(" #tanggal ").val() + "&ret_date=&adult=" + $(" #penumpang ").val() + "&infant=0";

									$.ajax({
										crossOrigin: true,
										url: "https://proxify-domain.herokuapp.com/?url=" + encodeURIComponent(theUrl),
										type: "GET"
									}).done(function(data){

										console.log("Data" + asal + " -> " + tujuan + " telah diambil");
										loading.counter--;

										try{
											var table = data.split('<tbody id="tbody_depart">')[1].split('</tbody')[0];
											table = html2json(table).child;
											// console.log(table);

											table.forEach(function(item,index){
												if(index % 2 != 0){

													var attr = item.attr;
													var info = item.child;
													var namaKereta = attr["data-name"].join("") + ":" + info[3].child[3].child[0].text.split("(")[1].split(")")[0] + "-" + info[5].child[3].child[0].text.split("(")[1].split(")")[0];

													// console.log(attr);

													// tambah nama kereta
													if( stasiun.kereta.indexOf(namaKereta) == -1 ){
														stasiun.kereta.push(namaKereta);

														var nama = info[1].child[1].child[0].text;
														var subClass = info[1].child[3].child[0].text;
														var waktuBerangkat = info[3].child[1].child[0].text;
														var stasiunBerangkat = stasiun.asal_long[ stasiun.asal.indexOf(info[3].child[3].child[0].text.split("(")[1].split(")")[0]) ];
														var stasiunBerangkatShort = info[3].child[3].child[0].text.split("(")[1].split(")")[0];

														var waktuKedatangan = info[5].child[1].child[0].text;
														var stasiunKedatangan = stasiun.tujuan_long[ stasiun.tujuan.indexOf(info[5].child[3].child[0].text.split("(")[1].split(")")[0]) ];
														var stasiunKedatanganShort = info[5].child[3].child[0].text.split("(")[1].split(")")[0];

														var durasi = info[7].child[1].child[0].text.trim();
														var harga = info[9].child[1].child[0].text;
														var kelas = info[11].child[1].child[0].text;

														// check availability
														if( info[13].child[1].child.length > 2 ){
															var link = info[13].child[1].child[1].attr.href;

															classID[stasiunBerangkatShort] = 1;
															classID[stasiunKedatanganShort] = 1;

															daftarKereta.push({
																nama: nama,
																subClass: subClass,
																waktuBerangkat: waktuBerangkat,
																stasiunBerangkat: stasiunBerangkat,
																stasiunBerangkatShort: stasiunBerangkatShort,
																waktuKedatangan: waktuKedatangan,
																stasiunKedatangan: stasiunKedatangan,
																stasiunKedatanganShort: stasiunKedatanganShort,
																durasi: durasi,
																harga: harga,
																kelas: kelas
															});

															// add listener to checkbox
															$(" .stas ").off().on("change", function(){
																
																var theId = $(this).attr("id");

																if( $(this).is(":checked") ){
																	
																	classID[theId] = 1;
																} else {
																	classID[theId] = 0;
																}

																// show or hide card
																$(" .box .jadwal .card ").each(function(){

																	var classes = $(this).attr("class").split(/\s+/);
																	var c = 0;

																	for(var i = 0; i < classes.length; i++ ){

																		if( typeof classID[classes[i]] !== 'undefined' ){

																			c += classID[classes[i]];
																		}
																	}

																	if( c < 2 ){
																		$(this).hide();
																	} else {
																		$(this).show();
																	}
																});
															});

															// console.log(info);
															// console.log(nama + " " + waktuBerangkat + " (" + stasiunBerangkat + ") - " + waktuKedatangan + " (" + stasiunKedatangan + ") Lama perjalanan " + durasi + ", kelas " + kelas + " @ " + harga);
														}
													}
												}
											});

											// console.log(stasiun.kereta);
										} catch(err) {
											// console.log(err);
											console.log("NOT FOUND: " + theUrl);
										}
									});
								}
							}
						});
					});

				} else {

					// change error tip text
					$(" .error-tip .text ").html("<strong>Error: </strong> Kota asal dan tujuan tidak boleh sama");

					// show error tip
					$(" .error-tip ").addClass("new").slideDown(300);

					setTimeout(function(){
						$(" .error-tip ").removeClass("new");
					}, 1000);

					setTimeout(function(){
						$(" .error-tip ").slideUp(300);
					}, 5000);
				}

			} 

			event.preventDefault();
		});
	}

	// method to implement reset search button
	var initResetSearch = function(){

		// add listener
		$(" .ulangi-pencarian ").click(function(){

			$(" main ").animate({
				scrollTop: 0
			}, 1000, "swing");
		});
	}

	// method to load station options
	var initOptions = function(){

		firebase.database().ref( "/stasiun" ).once("value").then(function(snapshot){

			var stasiun = snapshot.val();

			$(" select.stasiun ").html("");

			for(var k in stasiun){
				if( stasiun.hasOwnProperty(k) ){
					
					var kota = k[0].toUpperCase() + k.substring(1);

					$(" select.stasiun ").append('<option val="' + k + '">' + kota + '</option>');
				}
			}
		});
	}

	// method to collapse filter box on mobile
	var initFilterBox = function(){

		$(" .list-content .list-filter h3 ").click(function(){

			$(this).next().slideToggle(300);
			$(this).toggleClass("expand");
		});
	}

}