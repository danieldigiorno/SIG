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
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",

  ]
  function(urlUtils, esriConfig, Map, Print, PrintTemplate, Locator, esriId, DistanceParameters, FeatureLayer, Geometry,
    Tiled, DynamicMapServiceLayer, GraphicsLayer, Search, Draw, Point, SimpleMarkerSymbol, SimpleLineSymbol,
    SimpleFillSymbol, Graphic, geodesicUtils, Units, Color, array, event, RouteTask, RouteParameters, FeatureSet,
    QueryTask, Query, webMercatorUtils, GeometryEngine, Extent, SpatialReference, dom, on) {

     //Creo el mapa
    myMap = new Map({
        fadeOnZoom: true
        zoom:4, 
        minZoom:4, 
        smartNavigation:false
    });

    // Cargar mapa base
    var tiled = new Tiled("http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer");
    map.addLayer(tiled);

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
        countryCode: "US"
      }
    ],
    map: myMap
  });

  search.on ("search-results", searchHandler);

   // Símbolo para los puntos
   var markerSymbol = {
    type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
    style: "circle",
    color: "blue",
    size: "12px",  // pixels

  };
  
   // Símbolo para el móvil
  var markerSymbol = {
    type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
    style: "square",
    color: "blue",
    size: "20px",  // pixels
    xoffset:0,
    yoffset:15
  };
  


    //Símbolo para la ruta
    var symbol = {
      type: "simple-line",  // autocasts as new SimpleLineSymbol()
      color: "lightblue",
      width: "4px",
      style: "short-dot"
    };
     
    // Capa donde se traen los puntos del servicio
    puntosServicioLayer = new GraphicsLayer({opacity:0.9});
    
    //Cargar puntos del servidor
  var pointsFL = FeatureLayer({
  url:"http://sampleserver5.arcgisonline.com/arcgis/rest/services/LocalGovernment/Events/FeatureServer/0",
    //mode: FeatureLayer.MODE_SNAPSHOT,
    outFields: ["*"], 
    source: [markerSymbol]
  });

  //Cargar servicio de ruteo
    var routeTask = new RouteTask({
        url: "http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World?token="+token.access_token
     });
     routeParams = new RouteParameters();
     routeParams.stops = new FeatureSet();
    // routeParams.outSpatialReference = {"wkid":102100};

  // Capa Ruta
    var routeGraphicLayer = new GraphicsLayer({opacity:0.9});
    var symbol = new SimpleFillSymbol();

    // Botón calcular ruta: Calcula la ruta para los STOPs ingresados
    on(dom.byId("rutaBtn"), "click", calcularRuta);
    function calcularRuta(){
      routeTask.solve(routeParams, dibujarRuta);
    }
    // Botón borrar rutas: Limpia las rutas dibujadas del mapa y de la lista
  on(dom.byId("borrarRutaBtn"), "click", borrarRutas);
  function borrarRutas() {
    for (var i=routes.length-1; i>=0; i--) {
      map.graphics.remove(routes.splice(i, 1)[0]);
    }
    routes = [];
    routeGraphicLayer.clear();
    if (rutaServicioLayer !== undefined) {
      rutaServicioLayer.clear();
    }
    $('#borrarRutaBtn').prop('disabled', true);
  }
    }); 