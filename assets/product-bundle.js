console.log("onload js");
$(document).on("click", ".productsimage .card__image", function(e) {
	var thisObj = $(this).closest(".productsimage").find("quick-view-product a");
	e.preventDefault();
	if (!thisObj.quickViewModal) {
		const target = e.currentTarget;
		target.classList.add('working');
		fetch(`${target.getAttribute('href')}${ target.getAttribute('href').includes('?') ? '&' : '?' }view=quick-view`)
			.then(response => response.text())
			.then(text => {

				const quickViewHTML = new DOMParser().parseFromString(text, 'text/html').querySelector('#product-quick-view');
				const quickViewContainer = document.createElement('div');
				quickViewContainer.innerHTML = `<modal-box id="modal-${target.dataset.id}"	
              class="modal modal--product" 
              data-options='{
                "enabled": false,
                "showOnce": false,
                "blockTabNavigation": true
              }'
              tabindex="-1" role="dialog" aria-modal="true" 
            >
              <div class="container--medium">
                <div class="modal-content">
                  <button class="modal-close" data-js-close data-js-first-focus style="position:absolute;margin:0;top:0;right:0">${window.KROWN.settings.symbols.close}</button>
                </div>
              </div>
              <span class="modal-background" data-js-close></span>
            </modal-box>`;

				thisObj.quickViewModal = quickViewContainer.querySelector('modal-box');
				document.body.appendChild(thisObj.quickViewModal);
				thisObj.quickViewModal.querySelector('.modal-content').innerHTML = quickViewHTML.innerHTML;
				if (!window.productPageScripts) {
					const scripts = thisObj.quickViewModal.querySelectorAll('script');
					scripts.forEach(elm => {
						const script = document.createElement('script');
						script.src = elm.src;
						document.body.append(script);
						window.productPageScripts = true;
					})
				}

				thisObj.quickViewModal.querySelector('.product-quick-view__close').addEventListener('click', () => {
					thisObj.quickViewModal.hide();
				});

				if (thisObj.quickViewModal.querySelector('[data-js-product-form]')) {
					thisObj.quickViewModal.querySelector('[data-js-product-form]').addEventListener('add-to-cart', () => {
						thisObj.quickViewModal.hide();
					});
				}
				setTimeout(() => {
					thisObj.quickViewModal.show();
					target.classList.remove('working');
				}, 250);
			});
	} else {
		thisObj.quickViewModal.show();
	}
});

$(document).ready(function() {
	const filterContainer = $(".mainboxli");
	filterContainer.on("click", function() {
		var collection_id = $(this).data("collection-id");
		const filterUrl = $(this).find(".tablisting").attr('value') // Update with your actual collection URL + filters
		$.get(filterUrl, function(data) {			
			$("#filtered-products .productsimage").css("display", "none");
			$eachProduct = $(data).find("#main-collection-product-grid .product-item.card");
			console.log($eachProduct);
			$($eachProduct).each(function() {
				console.log($(this).attr('data-product'));
				$eachProductId = $(this).attr('data-product');
				$(".productsimage[data-product='" + $eachProductId + "']").attr("data-collection",collection_id);
				$(".productsimage[data-product='" + $eachProductId + "']").css("display", "block");
			});
		}).fail(function(error) {
			console.error("Error fetching products:", error);
		});
	});

	const filterContainerselect = $("#product-filterselect");
	filterContainerselect.on("change", function() {
		$selectValue = $(this).val();
		const filterUrl = $(this).val() // Update with your actual collection URL + filters

		$.get(filterUrl, function(data) {
			$("#filtered-products .productsimage").css("display", "none");
			$eachProduct = $(data).find("#main-collection-product-grid .product-item.card");
			$($eachProduct).each(function(index) {
				$eachProductId = $(this).attr('data-product');
				$(".productsimage[data-product='" + $eachProductId + "']").css("display", "block");
			});
		}).fail(function(error) {
			console.error("Error fetching products:", error);
		});
	});

	$(document).on("click", ".product-quantity__plus", function() {
		$variantQty = $(this).closest(".productQty").find(".product-quantity__selector").val();
		$var_id = $(this).closest(".productsimage").data("variant");
		$html = $(this).closest(".productsimage").html();
		$summeryindex = $(this).closest(".container-box").attr('data-summery-index');
		if ($variantQty == 1) {
			$(".box-summary").append("<div class='productsimage'>" + $html + "</div>");
		} else {
			// $('.box-summary .container-box[data-summery-index="' + $summeryindex + '"] .product-quantity__selector').val($variantQty);
			$('.box-summary .container-box[data-summery-index="' + $summeryindex + '"] .product-quantity__minus').removeClass('disabled');
			$(".main-custombundle div[data-variant='" + $var_id + "']").find('.product-quantity__selector').val($variantQty);
			$(".box-summary div[data-variant='" + $var_id + "']").find('.product-quantity__selector').val($variantQty);
		}
		getcartTotalQty();
	});

	$(document).on("click", ".product-quantity__minus", function() {
		var selected_item = getCookie("variantids");
		var variant_qty = getCookie("variant_qty");
		var delimiter = ",";
		var itemArray = selected_item.split(delimiter);
		var itemQtyArray = variant_qty.split(delimiter);
		$var_id = $(this).closest(".productsimage").data("variant");
		$variantQtyMinus = $(this).closest(".productQty").find(".product-quantity__selector").val();
    		$summeryindex = $(this).closest(".container-box").attr('data-summery-index');
		for (var i = 0; i < itemArray.length; i++) {
			if ($.trim($var_id) == itemArray[i].trim()) {
				if (itemQtyArray[i].trim() == $variantQtyMinus) {
					itemArray.splice(i, 1);
					itemQtyArray.splice(i, 1);
					setCookie("variantids", itemArray, {path: '/'});
					setCookie("variant_qty", itemQtyArray, {path: '/'});
					$(".box-summary").find('.container-box[data-summery-index="' + $summeryindex + '"]').closest(".productsimage").remove();
					$(".main-custombundle div[data-variant='" + $var_id + "']").find(".productQty").removeClass("show");
					$(".main-custombundle div[data-variant='" + $var_id + "']").find(".addButton").css("display", "block");
				}
			}
		}
		$(".main-custombundle div[data-variant='" + $var_id + "']").find('.product-quantity__selector').val($variantQtyMinus);
		$(".box-summary div[data-variant='" + $var_id + "']").find('.product-quantity__selector').val($variantQtyMinus);
		getcartTotalQty();
	});

	$(".productSelect").change(function() {
		$giftVariantid = $(this).find(":selected").val();
		console.log($giftVariantid);
		$(this).attr("data-vid", $giftVariantid);
	});

	// $('.addToCart').click(function(e) {
	// 	e.preventDefault();
	// 	$giftVariantid = $('.productSelect').attr("data-vid");
	// 	var PRODUCT_ID = $(this).closest(".bundle_product").find(".product_variant_id").val();
	// 	var selected_product_items = [];
	// 	$.each($("#cartSummary .productsimage"), function() {
	// 		$currentVarQty = $(this).find(".product-quantity__selector").val();
	// 		var $currentvartitle = $(this).find(".variant-title").html();
	// 		$perticular_propertie = $currentVarQty + "*" + $currentvartitle;
	// 		selected_product_items.push($perticular_propertie);
	// 	});

	// 	const objectItems = {};
	// 	$.each(selected_product_items, function(index, item) {
	// 		objectItems[index] = item;
	// 	});

	// 	$finalproperties = objectItems;
	// 	$.ajax({
	// 		url: '/cart/add.js',
	// 		dataType: 'json',
	// 		type: 'POST',
	// 		data: {
	// 			id: PRODUCT_ID,
	// 			quantity: 1,
	// 			properties: $finalproperties
	// 		},
	// 		success: function(response) {
	// 			removeCookie("variantids");
	// 			removeCookie("variant_qty");
	// 			addGiftproduct($giftVariantid);
	// 		},
	// 		error: function(jqXHR, textStatus, errorThrown) {
	// 			console.log('Error:', textStatus, errorThrown);
	// 		}
	// 	});
	// });
	
	$('.addToCart').click(function(e) {
		e.preventDefault();
		console.log("ADDTOCART");
		$(".subscriptionlabel").each( function( i ) {
			console.log("in each ");
			if($(this).hasClass('active')){
				$dataValue = $(this).data('value');
				if($dataValue == "subscribe & save"){
					console.log("SUBSCRIBE")
					subscriptionAddtocart();
				}else{
					onetimeAddtocart();
				}
			}
		});
	});
	function onetimeAddtocart(){
		console.log("ONE TIME");
		$giftVariantid = $(".product-variant-select").val();
		var PRODUCT_ID = $(this).closest(".bundle_product").find(".product_variant_id").val();
		var bundle_product_arr = {};
		var bundleObject = {
			externalProductId: PRODUCT_ID,
			externalVariantId: $giftVariantid ,
			selections: []
		};

		$.each($("#cartSummary .productsimage"), function() {
			$currentVarQty = $(this).find(".product-quantity__selector").val();
			var product_id = $(this).data("product");
			var variant_id = $(this).data("variant");

			console.log(variant_id);
			var collection_id = $(this).data("collection");

			var item_data = {
				collectionId: collection_id,  // Example Shopify Collection
				externalProductId: product_id,  // Dynamic Product ID
				externalVariantId: variant_id,  // Dynamic Variant ID
				quantity: $currentVarQty  // Dynamic Quantity
			}
			bundleObject.selections.push(item_data);
			
		});
		const bundle = bundleObject;
		console.log(bundle);
		const bundleItems = recharge.bundle.getDynamicBundleItems(bundle, 'shopifyProductHandle');
		console.log(bundleItems);
		const cartData = { items: bundleItems };
		const asyncGetCall = async () => {

		const respons = await fetch(window.Shopify.routes.root + 'cart/add.js', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(cartData),
			});
			const data = await respons.json();
			if($giftVariantid !== undefined){
				addGiftproduct($giftVariantid);
			}else{
				removeCookie("variantids");
				removeCookie("variant_qty");
				window.location.href = '/checkout';
			}
		}
		asyncGetCall();
	}
	function subscriptionAddtocart(){
		$giftVariantid = $(".product-variant-select").val();
		var PRODUCT_ID = $(this).closest(".bundle_product").find(".product_variant_id").val();
		var bundle_product_arr = {};
		var bundleObject = {
			externalProductId: PRODUCT_ID,
			externalVariantId: $giftVariantid ,
			selections: []
		};
		var static_frequancy = 15;
		// var selling_plan_id = $("#sellingPlan"+meta.product.id).val();
		var selling_plan_id = $( "input[name='selling_plan']").val();
		console.log(meta.product.id + " MTEA PRODUCT");
		console.log(selling_plan_id + " selling_plan_id");
		
		if(selling_plan_id ==  undefined){
			if(window.Recharge.widgets[meta.product.id] !== undefined){
				var selling_plans = window.Recharge.widgets[meta.product.id].product.selling_plan_groups;
				for(var i = 0; i < selling_plans.length; i++){
					for(var j = 0; j < (selling_plans[i].selling_plans).length; j++ ){
						var selling_plan_details = selling_plans[i].selling_plans[j];
						if(selling_plan_details.order_interval_frequency == static_frequancy){
							selling_plan_id = selling_plan_details.selling_plan_id;
						}
					}
				}
			}
		}

		bundleObject.sellingPlan = selling_plan_id;
		$.each($("#cartSummary .productsimage"), function() {
			$currentVarQty = $(this).find(".product-quantity__selector").val();
			var product_id = $(this).data("product");
			var variant_id = $(this).data("variant");

			console.log(variant_id);
			var collection_id = $(this).data("collection");
			var sellingplan_id = (selling_plan_id == '689131815193') ? $(this).data("selling15") : $(this).data("selling30");

			var item_data = {
				collectionId: collection_id,  // Example Shopify Collection
				externalProductId: product_id,  // Dynamic Product ID
				externalVariantId: variant_id,  // Dynamic Variant ID
				quantity: $currentVarQty,  // Dynamic Quantity
				sellingPlan: sellingplan_id // Dynamic Selling Plan ID
			}
			bundleObject.selections.push(item_data);
			
			// var $currentvartitle = $(this).find(".variant-title").html();
			// $perticular_propertie = $currentVarQty + "*" + $currentvartitle;
			// selected_product_items.push($perticular_propertie);
		});
		const bundle = bundleObject;
		console.log(bundle);
		const bundleItems = recharge.bundle.getDynamicBundleItems(bundle, 'shopifyProductHandle');
		console.log(bundleItems);
		const cartData = { items: bundleItems };
		const asyncGetCall = async () => {

		const respons = await fetch(window.Shopify.routes.root + 'cart/add.js', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(cartData),
			});
			const data = await respons.json();
			if($giftVariantid !== undefined){
				addGiftproduct($giftVariantid);
			}else{
				removeCookie("variantids");
				removeCookie("variant_qty");
				window.location.href = '/checkout';
			}
		}
		asyncGetCall();
	}
	function addGiftproduct(giftVariantid) {
		$.ajax({
			url: '/cart/add.js',
			dataType: 'json',
			type: 'POST',
			data: {
				quantity: 1, // Adjust the quantity as needed
				id: giftVariantid
			},
			success: function(response) {
				// Handle the success response here
				removeCookie("variantids");
				removeCookie("variant_qty");
				window.location.href = '/checkout';
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log('Error:', textStatus, errorThrown);
			}
		});
	}
  
	set_lineitems_onload();
	$(".addButton").on("click", function() {
		console.log("addButton  click");
		$var_id = $(this).closest(".productsimage").data("variant");
		$product_id = $(this).closest(".productsimage").data("product");
		$selling_plan_15id = $(this).closest(".productsimage").data("selling15");
		$selling_plan_30id = $(this).closest(".productsimage").data("selling30");
		$collection_id = $(this).closest(".productsimage").data("collection");
		$(this).css("display", "none");
		$(this).closest(".container-box").find(".product-quantity").addClass("show");
		$html = $(this).closest(".productsimage").html();
		$(".box-summary").append("<div class='productsimage' data-selling30='"+$selling_plan_30id+"' data-selling15='"+$selling_plan_15id+"' data-variant='" + $var_id + "' data-product='"+$product_id+"' collection-id='"+$collection_id+"' data-collection='"+$collection_id+"'>" + $html + "</div>");
		getcartTotalQty();
	});

	function set_lineitems_onload() {
		var selected_item = getCookie("variantids");
		var variant_qty = getCookie("variant_qty");
		if (selected_item) {
			var delimiter = ",";
			var itemArray = selected_item.split(delimiter);
			var itemQtyArray = variant_qty.split(delimiter);
			for (var i = 0; i < itemArray.length; i++) {
				var product_item = itemArray[i].trim();
				var product_item_qty = itemQtyArray[i].trim();
				$("div[data-variant='" + product_item + "']").find(".product-quantity").addClass("show");
				$("div[data-variant='" + product_item + "']").find(".productQty .qty-minus").removeClass('disabled');
				$("div[data-variant='" + product_item + "']").find(".addButton").css("display", "none");
				$("div[data-variant='" + product_item + "']").find(".productQty .product-quantity__selector").val(product_item_qty);
				$product_id = $("div[data-variant='" + product_item + "']").data("product");
				$collection_id = $("div[data-variant='" + product_item + "']").data("collection");
				$selling_plan_15id = $("div[data-variant='" + product_item + "']").data("selling15");
				$selling_plan_30id = $("div[data-variant='" + product_item + "']").data("selling30");
				$getHtml = $(".main-custombundle div[data-variant='" + product_item + "']").html();
				$(".box-summary").append("<div class='productsimage' data-selling30='"+$selling_plan_30id+"' data-selling15='"+$selling_plan_15id+"' data-variant='" + product_item + "' data-product='"+$product_id+"' data-collection='"+$collection_id+"'>" + $getHtml + "</div>");
				$(".box-summary div[data-variant='" + product_item + "']").find(".productQty .product-quantity__selector").val(product_item_qty);
				$(".box-summary div[data-variant='" + product_item + "']").find(".productQty .qty-minus").removeClass('disabled');
			}
		}
		getcartTotalQty();
	}

	function getcartTotalQty() {
		var selected_items = [];
		var selected_item_qty = [];
		var cartTotQty = 0;
		var productPrice = 0;
    	var indicatore = 0;
		$splitMinPrice = $(".minCartprice").val().split("$");
		var inputtotalrange = $splitMinPrice[1];
		$splitMaxPrice = $(".maxCartprice").val().split("$");
		var inputtotalrangemax = $splitMaxPrice[1];
		$.each($(".subscriptionlabel"), function(index) {
			if($(this).hasClass('active')){
				$dataValue = $(this).data('value');
				if($dataValue == "subscribe & save"){
					inputtotalrange = Math.round(inputtotalrangemax - (inputtotalrangemax*35)/100);
				}
				console.log(inputtotalrange + "inputtotalrange");
				// return false;
			}
		});
		$productPrices = 0;
		$.each($("#cartSummary .productsimage .product-quantity__selector"), function(index) {

			cartTotQty += parseInt($(this).val());
			$currentVarQty = $(this).val();
			$price = $(this).closest(".productsimage").find(".product-price--original").data("price");
			console.log($price);
			$Dataprice = ($price != undefined) ? $price.split("$") : 0;
			if ($Dataprice != 0) {
				$productPrices += $currentVarQty * parseInt($Dataprice[1]);
				console.log($productPrices + "TP");
			}

			var varId = $(this).closest(".productsimage").find(".variant-title").data("id");
			var checkExistingVal = $.inArray(varId, selected_items);
			if (checkExistingVal !== -1) {
				selected_items[checkExistingVal] = varId;
				selected_item_qty[checkExistingVal] = $currentVarQty;
			} else {
				selected_items.push(varId);
				selected_item_qty.push($currentVarQty);
			}
			setCookie("variantids", selected_items, 7);
			setCookie("variant_qty", selected_item_qty, 7);

		});
		// var productPrice = $("#rangeSlider").attr("step");
		// var pro_price = cartTotQty * parseInt($productPrices);
    
		indicatore = ($productPrices * 100)/inputtotalrange;
		if ($productPrices <= inputtotalrange) {
			$("#rangeSlider").val($productPrices);
			$(".range-slider__indicators .range-slider__value").css("left",indicatore+"%");
		} else if ($productPrices > inputtotalrange) {
			$("#rangeSlider").val(inputtotalrange);
			$(".range-slider__indicators .range-slider__value").css("left","100%");
		}
		// do't remove this comment
		// $(".range-slider__indicators .range-slider__value").html("$"+$productPrices);
		// do't remove this comment

		$remain_amount = inputtotalrange - $productPrices;

		if ($remain_amount < 1) {
			console.log("GIFTPRODUCT ADD");
			$remain_amount = '';
			$(".addToCart").prop('disabled', false);
			$(".addToCart").css("cursor", "pointer");
			if (!$(".productsimage").hasClass("giftProduct")) {
				$(".box-giftproduct").addClass("show");
			}
		} else {
			$(".box-giftproduct").removeClass("show");
			$(".addToCart").attr("disabled", "disabled");
			$(".addToCart").css("cursor", "not-allowed");
			$remain_amount = "$" + $remain_amount + " Left to ";
		}
		$(".addToCart").find("span").text($remain_amount + " Checkout ($" + $productPrices + ")");
		$(".stickyAddtocart").find("span").text($remain_amount + " Checkout ($" + $productPrices + ")");
		return cartTotQty;
	}
	$(document).on("click", ".stickycartbtn", function() {
		console.log("stocky btn click");
		$(".cartcolumn").addClass("active");
	});
	$(document).on("click", ".containerCircle", function() {
		$(".cartcolumn").removeClass("active");
	});
	$(document).on("click",".subscriptionOption",function(){
		console.log("CLICK");
		$(this).closest(".subscriptionlabel").addClass("active");
		$(".onetimeOption").closest(".subscriptionlabel").removeClass("active");
		$(".deliverybox").removeClass("hide");
		$(".rc-selling-plans").removeClass("hide");

		getcartTotalQty();
	});
	$(document).on("click",".onetimeOption",function(){
		console.log("CLICK");
		$(this).closest(".subscriptionlabel").addClass("active");
		$(".subscriptionOption").closest(".subscriptionlabel").removeClass("active");
		$(".deliverybox").addClass("hide");
		$(".rc-selling-plans").addClass("hide");
		getcartTotalQty();
	});
});

function setCookie(name, value, daysToExpire) {
	var date = new Date();
	date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
	var expires = "expires=" + date.toUTCString();
	document.cookie = name + "=" + value + "; " + expires + "; path=/";
}

function removeCookie(cookieName) {
  document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function getCookie(name) {
	var cookieName = name + "=";
	var cookieArray = document.cookie.split(';');
	for (var i = 0; i < cookieArray.length; i++) {
		var cookie = cookieArray[i].trim();
		if (cookie.indexOf(cookieName) === 0) {
			return cookie.substring(cookieName.length, cookie.length);
		}
	}
	return null;
}