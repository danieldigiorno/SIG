var map;
var s;
var locatorUrl = "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
var puntos;
var puntos = [];
var routes = [];
var routeTask;
var routeParams;
var routeGraphicLayer;
var terminarSimulacion = false;
var iter, salto = 0;
var movilPosicion; // Posición del movil
var distanciaPuntos = 0;
var stateActual = "";
var stateAnterior = "";
var color_actual = 1;
var puntosServicioLayer;
var rutaServicioLayer;

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Search",
    "esri/tasks/RouteTask",
    "esri/tasks/support/RouteParameters",
    "esri/tasks/support/FeatureSet",
    "esri/Graphic",
    "esri/widgets/Widget",
    "esri/layers/FeatureLayer",
  ]
  function(urlUtils, esriConfig, Map, Print, PrintTemplate, Locator, esriId, DistanceParameters, FeatureLayer, Geometry,
    Tiled, DynamicMapServiceLayer, GraphicsLayer, Search, Draw, Point, SimpleMarkerSymbol, SimpleLineSymbol,
    SimpleFillSymbol, Graphic, geodesicUtils, Units, Color, array, event, RouteTask, RouteParameters, FeatureSet,
    QueryTask, Query, webMercatorUtils, GeometryEngine, Extent, SpatialReference, dom, on) {

     //Creo el mapa
    myMap = new Map({
        basemap: 'streets', 
        zoom:4, 
        minZoom:4, 
        
        smartNavigation:false
    });

    //Creo la vista del mapa
    var view = new MapView({
        container: "viewDiv",
        map: myMap,
        center: [-95,39],

      });

  // Buscador de puntos
 var search = new Search({sources: [
      {
        locator: new Locator(locatorUrl),
        placeholder: "Geocodificacion",
        countryCode: "US",
      }
    ],
    map: myMap
  });

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
    puntosServicioLayer = new GraphicsLayer({opacity:0.9});
    
    //Cargar puntos del servidor
  var pointsFL = FeatureLayer({
  url:"http://sampleserver5.arcgisonline.com/arcgis/rest/services/LocalGovernment/Events/FeatureServer/0"
    //mode: FeatureLayer.MODE_SNAPSHOT,
    //outFields: ["*"]
  });
  pointsFL.setSelectionSymbol(markerSymbol);
  
  //Cargar servicio de ruteo
    var routeTask = new RouteTask({
        url: "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World"
     });
     routeParams = new RouteParameters();
     routeParams.stops = new FeatureSet();
    }); 