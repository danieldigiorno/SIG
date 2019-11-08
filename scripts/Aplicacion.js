var token;

      require([
      "esri/config",
      "esri/map",
      "esri/tasks/locator",
      "esri/IdentityManager",
      "esri/tasks/DistanceParameters",
      "esri/layers/FeatureLayer",
      "esri/tasks/geometry",
      "esri/layers/ArcGISTiledMapServiceLayer",
      "esri/layers/ArcGISDynamicMapServiceLayer",
      "esri/layers/GraphicsLayer",
      "esri/dijit/Search",
      "esri/toolbars/draw",
      "esri/geometry/Point",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/symbols/SimpleLineSymbol",
      "esri/symbols/SimpleFillSymbol",
      "esri/graphic",
      "esri/geometry/geodesicUtils",
      "esri/units",
      "esri/Color",
      "dojo/_base/array",
      "dojo/_base/event",
      "esri/tasks/RouteTask",
      "esri/tasks/RouteParameters",
      "esri/tasks/FeatureSet",
      "esri/tasks/QueryTask",
      "esri/tasks/query",
      "esri/geometry/webMercatorUtils",
      "esri/geometry/geometryEngine",
      "esri/geometry/Extent",
      "esri/SpatialReference",
      "dojo/dom",
      "dojo/on",
      "dojo/domReady!"], function( esriConfig ,Map, ArcGISTiledMapServiceLayer,GraphicsLayer,Point,SpatialReference,Search,SimpleMarkerSymbol,SimpleLineSymbol, Color,SimpleFillSymbol, FeatureLayer) {
        
        $.ajax({
          'url': "https://www.arcgis.com/sharing/rest/oauth2/token/",
          'dataType': "json",
          'content-Type': 'x-www-form-urlencoded',
          'data': {
              'client_id': 'DHxuEWKcbfnwe1pj',
              'client_secret': 'b6b8c27cd2704c3aaa1a0f37abd32e75',
              'grant_type': 'client_credentials'
          },
          'type': 'POST',
          'success': function(response) {
              token = response.access_token;
              expiresIn = response.expires_in;
          },
          'error': function(errorThrown) {
              alert(errorThrown.error);
          }
      });

       var map = new Map("map", {
          fadeOnZoom: true,
          center: [-95,39], // longitude, latitude
           zoom:4, 
          minZoom:4,
          smartNavigation:false
        });
        var tiled = new ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer");
          map.addLayer(tiled);
          // Buscador de puntos
      var search = new Search({sources: [
          {
            locator: new Locator(locatorUrl),
            placeholder: "Buscador de puntos",
            countryCode: "US",
          }
        ],
        map: map
        }, "search");

        search.startup();
        search.on ("search-results", searchHandler);
      
       // Símbolo para los puntos
  var markerSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE);
  markerSymbol.setColor(new Color("#0101DF"));
  markerSymbol.setSize(13);

  // Símbolo para el móvil
  var movilSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE);
  movilSymbol.setPath("M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z");
  movilSymbol.setOffset(0, 15);
  movilSymbol.setColor(new Color("#FF4500"));
  movilSymbol.setSize(20);

  //Símbolo para la ruta
  var routeSymbol = new SimpleLineSymbol().setColor(new Color([0,0,255,0.5])).setWidth(4);

  // Capa donde se traen los puntos del servicio
  var puntosServicioLayer = new GraphicsLayer({opacity:0.9});

  //Cargar puntos del servidor
  var pointsFL = FeatureLayer("http://sampleserver5.arcgisonline.com/arcgis/rest/services/LocalGovernment/Events/FeatureServer/0", {
    mode: FeatureLayer.MODE_SNAPSHOT,
    outFields: ["*"]
  });
  pointsFL.setSelectionSymbol(markerSymbol);
      
   //Configuración de proxy
   esriConfig.defaults.io.proxyUrl = "/proxy/";
   esriConfig.defaults.io.alwaysUseProxy = false;    
      
      
      
      
      
      });
