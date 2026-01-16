# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["AlgoPuzzleBoard.MVC.csproj", "./"]
RUN dotnet restore "./AlgoPuzzleBoard.MVC.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/."
RUN dotnet build "AlgoPuzzleBoard.MVC.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "AlgoPuzzleBoard.MVC.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AlgoPuzzleBoard.MVC.dll"]
