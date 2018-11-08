var API_KEY = 'AIzaSyCuTTC7TWNKkPCTOGW8XMY67S8Cy_bQDsI';

// função para inicializar o google map
function initMap(lat, lng) {

    var styles = [{
        featureType: 'all',
        elementType: 'all',
        stylers: [
            { saturation: -100 }
        ]}
    ];

    var map = document.getElementById('map');

    var mapOptions = {
        center: new google.maps.LatLng(lat, lng),
        zoom: 17,
        scrollwheel: true,
        disableDefaultUI: false,	 
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'tehgrayz']
        }
    };  

    var map = new google.maps.Map(map, mapOptions);

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        map: map,
        icon: "/static/pin.png"
    });
}
    
    // start script
;(function($, document) {

    var $doc = $(document);  
  
    var cb = function() {
      $doc.ready(function () {
        var mp = new managerMap();
        mp.init();
      });
    };

    $doc.ready(cb);
})
(jQuery, document);    
    
var managerMap = function () {

  this.init = function () {
    var self = this;

    // load
    this.f_load = document.getElementById("f_load");

    // pegando elemento <select>[name=select-state]
    this._selectState = document.getElementsByName('select-state-b2c')[0];
    
    // pegando elemento <select>[name=select-cidade]
    this._selectCity = document.getElementsByName('select-city-b2c')[0];

    // pegando elemento <select>[name=select-local]
    this._selectLocal = document.getElementsByName('select-local-b2c')[0];

    // pegando elemento nome do estado
    this._elementoEstado = document.getElementById("f_estado-b2c");

    // pegando elemento nome da cidade
    this._elementoCidade = document.getElementById("f_cidade-b2c");

    // pegando elemento nome da cidade
    this._elementoLocal = document.getElementById("f_local-b2c");

    // pegando elemento info
    this._elementoInfo = document.getElementById("f_elemento__info-b2c");

    this._elementoEnd = document.getElementById("f_elemento__end-b2c");
    this._elementoComp = document.getElementById("f_elemento__comp-b2c");
    this._elementoTel = document.getElementById("f_elemento__tel-b2c");

    // pegando botão de resetar busca
    this._elementoResetarBusca = document.getElementById("reset_search-b2c");

    // definindo atributo para manipular resultados dos endereços
    self._mdResponseData = [];

    // pegando locais no master data
    this.getLocals(function (res) {        
      // filtrando o retorno
      res.forEach(function (e) {
        // alimento o array apenas se os dados existirem
        if ( e.cep !== null ) {
          self._mdResponseData.push(e);
        }
      });
      
      if( self._mdResponseData.length ) {
        // construindo estrutura dos dados
        self._mdResponseData = self.buildDataResponse(self._mdResponseData);
        self._mdResponseData.estado.sort(function(a,b) {
          return a.nome < b.nome ? -1 : a.nome > b.nome ? 1 : 0;
        });
        
        self.addListState();
      } 
    });

    // adicionando eventos
    // adicionando evento "chenge" na lista de estados
    this._selectState.addEventListener("change", function () {
      self.addListCity(this.value);

      // limpando lista de locais
      self._selectLocal.innerHTML = '<option selected="">Selecione</option>';
    });

    // adicionando evento "change" na lista de cidades
    this._selectCity.addEventListener("change", function () {
      var stateSelectedIndex = self._selectState.options.selectedIndex - 1;
      self.addListLocal(stateSelectedIndex, this.value, 0);
      self.clearFormInfo();
    });

    // adicionando evento "change" na lista de locais
    this._selectLocal.addEventListener("change", function () {
      
      $('#f_load').show();
      self.clearFormInfo();

      var stateSelectedIndex = self._selectState.options.selectedIndex - 1;
      var citySelectedIndex  = self._selectCity.options.selectedIndex - 1;

      // pegando local selecionado
      var iLocal = self._mdResponseData.estado[stateSelectedIndex].cidade[citySelectedIndex].local[this.value];

      var endereco = iLocal.numero + ' '
        + iLocal.endereco + ' '
        + iLocal.cidade + ' '
        + iLocal.estado;

      // atualizando mapa de acordo com o local informado
      self.getLatLong(endereco, function(cbData) {
        initMap(cbData.lat, cbData.lng);

        // Remove imagem tampão
        $('#tampao').fadeOut(500);

        // atualizando informações do form
        self.setFormInfo(iLocal);
        $('#f_load').hide();
      });
    });

    // adicionando evento "click" no botão de refazer busca
    this._elementoResetarBusca.addEventListener("click", function () {
      self._selectState.innerHTML = '<option selected="">Selecione</option>';
      self._selectCity.innerHTML = '<option selected="">Selecione</option>';
      self._selectLocal.innerHTML = '<option selected="">Selecione</option>';
      self.addListState(0); // inforando primeira cidade da lista do primeiro estado // local esta atrelado e sera alterado automaticamente
      self.clearFormInfo();
      $('#tampao').fadeIn(500);
    });
  }

  // pegando o lat e long by address
  this.getLatLong = function (address, callback) {
    console.log('buscando...');
    var http = new XMLHttpRequest();
    http.open("GET", "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + API_KEY);
    http.onload = function () {
      var res = JSON.parse(http.responseText);

      if (res.status === "OK") {
        console.log('LATITUDE E LONGITUDE ENCONTRADA COM SUCESSO!', res.results[0].geometry.location);
        callback(res.results[0].geometry.location);
      } else {
        console.log("ERRO AO BUSCAR LAT E LONG DO END: https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + API_KEY);
      }
    }

    // enviando requisição
    http.send();
  }

  // pegando locais no master data
  this.getLocals = function(callback) {
      // iniciando uma obj http
      var http = new XMLHttpRequest();
      // http.open("GET", "http://api.vtex.com.br/rommanel/dataentities/EL/search?_fields=cep,cidade,endereco,estado,complemento,latitude,local,longitude,numero,telefone");
      http.overrideMimeType("application/json");
      http.open("GET", "/static/lojas.json");
      http.setRequestHeader("REST-Range", "resources=0-5000");      
      http.onload = function () {
        // convertendo a resposta para JSON
        var res = JSON.parse(http.responseText);
        // callback function
        callback(res);
      }

      // enviando requisição
      http.send();
  }

  // aplicando informações do endereço no form
  this.setFormInfo = function (local) {
    //alterando o nome da cidade
    this._elementoCidade.textContent = local.cidade;

    // alterando o nome do estado
    this._elementoLocal.textContent =  local.local;
    
    // alterando as informações de endereço, numero, cep e telefone
    // FORMATO: Rua 24 de Maio, 70 - Cep: 01041-001 (11) 2575-0060
    //this._elementoInfo.textContent = local.endereco + ", " + local.numero + " - " + local.complemento + "<br>Cep: " + local.cep + "<br>" + local.telefone;

    this._elementoEnd.textContent = local.endereco + ", " + local.numero;
    this._elementoTel.textContent = "Telefone: " + local.telefone;
    this._elementoComp.textContent = ", " + local.complemento;

    if ( local.complemento === null ) {
      this._elementoComp.textContent = " ";
    }else{
      this._elementoComp.textContent = ", " + local.complemento;
    }
  }

   // clear from
   this.clearFormInfo = function (local) {    
    this._elementoCidade.textContent = '';
    this._elementoLocal.textContent =  '';
    this._elementoEnd.textContent = '';
    this._elementoTel.textContent = '';
    this._elementoComp.textContent = '';
  }

  this.getIndex = function (search, arrayData) {      
    r = null;
    arrayData.forEach( function (e, i) {        
      if( search == e.nome )
        r = i;
    });
    return r;
  }

  this.hasState = function (structure, nameState) {
    // peristindo retorno
    var res = false;

    // caso a estrutura passada não tiver nenhum indice ainda retornar falso direto
    if( !structure.estado.length )
      res =  false;

    // passando pela estrutura para tentativa de encontrar o estado informado
    structure.estado.forEach( function (eStructure, iStructure) {        
      // caso encontrar retornar true
      if( eStructure.nome == nameState ) {
          res = true;
      }
    });
    return res;
  }

  // constroi dados de retorno para o formulário de seleção no mapa
  this.buildDataResponse = function (data) {
    // persistindo escopo
    var self = this;

    // iniciando estrutura
    var returnData = {
        estado : []
    };

    // passando pelos resultados retornados do master data
    // construir uma estrutura para retorno dos dados filtrados
    data.forEach( function (e, i) {      
      // inserindo estado na estrutura caso não existir
      if( self.hasState(returnData, e.estado) == false ) {          
        // iniciando um objeto de retorno
        returnData.estado.push({
            "nome" : e.estado,
            "cidade" : [
                {
                    nome : e.cidade,
                    local : [e]
                }
            ]
        });
      } else {          
        // verifica se estado existe dentro de return data e retorna o indice
        var indexFindState = self.getIndex(e.estado, returnData.estado);

        // se encontrar o estado dentro de returnData
        if( typeof indexFindState == "number" ) {          
          // armazena na variavel o valor da cidade dentro do estado caso existir
          var indexFindCity = self.getIndex(e.cidade, returnData.estado[indexFindState].cidade);
          
          // verifica se o valor é do tipo numerico
          if( typeof indexFindCity == "number" ) {            
            // adiciona um novo local para a cidade
            returnData.estado[indexFindState].cidade[indexFindCity].local.push(e);              
          } else {
            // adiciona uma nova cidade no estado caso não houver nenhuma
            returnData.estado[indexFindState].cidade.push({
                nome : e.cidade,
                local : [e]
            });
          }
        } else {
          // caso entrar aqui é porque houve uma falha de dados
          console.error("Não foi encontrado o estado: " + e.estado)
        }
      }
    });

    return returnData;
  }

  this.addListState = function () {      
    this._selectState.innerHTML = '<option selected="">Selecione</option>';

    var self = this;

    // passa em todos os estados da lista e adiciona no select de estados
    this._mdResponseData.estado.forEach(function (e, i) {        
      var option = document.createElement("option");
      option.value = i;
      option.textContent = e.nome;

      self._selectState.appendChild(option);
    });    
  }

  // adiciona cidades no <select>
  this.addListCity = function (indexState) {
    
    // limpando lista de cidades
    this._selectCity.innerHTML = '<option selected="">Selecione</option>';

    // persistindo escopo
    var self = this;

    // passando em todas as cidades
    this._mdResponseData.estado[indexState].cidade.forEach(function (e, i) {
      var option = document.createElement("option"); // criando elemento option
      option.dataset.indexstate = indexState; // adiciona indice do estado pai em data-indexstate
      option.value = i; // inserindo valor no option
      option.textContent = e.nome; // inserindo conteudo no option

      self._selectCity.appendChild(option); // adicionando option na lista de cidades
    });
  }

  // adiciona locais no <select>
  this.addListLocal = function (indexState, indexCity, localSelected) {
    // limpando lista de locais
    this._selectLocal.innerHTML = '<option selected="">Selecione</option>';

    // persistindo escopo
    var self = this;

    this._mdResponseData.estado[indexState].cidade[indexCity].local.forEach(function (e, i) {      
      var option = document.createElement("option"); // criando elemento option
      option.value = i; // inserindo valor no option
      option.textContent = e.local; // inserindo conteudo no option

      self._selectLocal.appendChild(option); // adicionando option na lista de cidades
    });      
  }
}