
# InProLa

InProLa é um projeto desenvolvido utilizando arquitetura plugavel para processar e indexar artigos cientificos escritos em Latex.
## Dependencias
Primeiramente será necessário instalar alguns programas em seu computador para que ele esteja habilitado para rodar o projeto.
- Node.js

  Para instalar o node.js no windows, acesse este [link](https://nodejs.org/), baixe e instale a última versão do node. Para confirmar que a instalação está ok, abra o console e rode ``node -v``, caso a resposta for uma versão, significa que está tudo ok.

- Gmail do InProLa

  Solicite ao responsável pelo projeto o acesso ao email, pois neste primeiro momento será necessário para adquirir os tokens de acesso.
## Rodar localmente
Para conseguir rodar o projeto é necessário um conjunto de credenciais para que as plataformas consigam identificar que o acesso está sendo realizado por pessoas autorizadas. Para isso serão necessárias 3 autenticações:

- .env

    - Na raiz do projeto você irá conseguir encontrar um arquivo ``.env.exemplo``, faça uma cópia dele para a raiz do projeto e renomeie para ``.env``.
    - Para conseguir o ``GOOGLE_FOLDER_ID`` você deve acessar o google drive do InProLa, acessar a pasta Artigos e copiar o último parâmetro da URL, por exemplo se a url for ``https://drive.google.com/drive/u/1/folders/123dasdfMasdf_asdf1234dsaf`` você deve copiar todo o conteúdo após ``folders/``, ne exemplo seria ``123dasdfMasdf_asdf1234dsaf``, e colar em no arquivo ``.env`` em frente ao ``GOOGLE_FOLDER_ID=``.

- MongoDb
    - Para criar o seu certificado ou baixar novamente você deve acessar o site do [MongoDb](https://account.mongodb.com/), fazer login com o gmail do InProLa, ir em Database Access que fica na categoria de Security.
        - Se você tiver criado um certificado antes, é só ir na opção de EDIT seu respectivo usuário, selecione a expiração do certificado, (aconselho por 24 meses) e clicar em Download new certificate, após o seu navegador baixar o certificado, crie uma pasta com o nome ``certs`` na raiz do projeto e cole este arquivo dentro dela.
        - Caso for um usuário novo, você deve clicar no botão Add New Database User, e utilizar as seguintes configurações:
            - Selecionar Certificate no Authentication Method;
            - Colocar seu nome e sobrenome em Common Name;
            - Marcar a caixa Download certificate when user is added;
            - Selecionar 24 months em Certificate Expiration;
            - Em Built-in Role, clique em Add Built-in Role e selecione Read and Write in Any Database;
            - Por fim, clique em Add User.
            - Após o seu navegador baixar o certificado, crie uma pasta com o nome ``certs`` na raiz do projeto e cole este arquivo dentro dela.
- GoogleApi
    - Faça login com o gmail do InProLa no [GoogleApi](https://console.cloud.google.com/welcome?project=inprola), após logado entre na área de [Api and Services](https://console.cloud.google.com/apis/dashboard?authuser=1&project=inprola-426821), acesse o menu de credentials no canto esquerdo.
    - Se a sua credencial já estiver sido criada antes, procure o sou nome e sobrenome e no canto direito clique no ícone com uma seta para baixo e aguarde o download ser concluído, após isso mova este arquivo para a pasta ``certs`` criada nos passos anteriores e renomeie o arquivo para credentials.json.
    - Caso ainda não tenha credencial, clique em + Create Credentials e selecione OAuth cliend ID, na próxima tela utilize as seguintes configurações:
        - Selecione Desktop App no campo de Application Type;
        - Name coloque o seu nome e sobrenome;
        - Clique em Create para finalizar o cadastro;
        - Após criar a sua credencial a página irá retornar para a tela de credenciais e irá abrir um modal, clique em Download Json e aguarde o seu navegador baixar o arquivo;
        - Mova o arquivo baixado para a pasta ``certs`` criada nos passos anteriores e renomeie o arquivo para credentials.json.
    - Para finalizar, um console na raiz do projeto e siga os seguintes passos:
        - Rode o comando npm install e após finalizar rode npm run start;
        - O projeto irá abrir o seu navegador e pedir para autorizar o acesso, selecione a conta do gmail do InProLa e clique em continuar;
        - Na tela seguinte marque as 2 caixinhas e clique em finalizar.
          Após isso, deverá ser possível ver uma mensagem na tela do seu navegador e o seu projeto terá tudo necessário para funcionar.



## EndPoints
- GET ``/``

  Irá testar se a conexão com o banco e as credenciais do google está funcionando.
- GET ``/process``

  Processar trabalhos já baixados localmente.
- GET ``/download``

  Baixar trabalhos do google drive.
- GET ``/downloadAndProcess``

  Baixar os trabalhos do google drive e processar todos em seguida.