@echo off
echo MotoEtiler Database Setup başlatılıyor...
echo.

REM SQL Server'a bağlan ve scripti çalıştır
sqlcmd -S "BILALKAYA\SQLEXPRESS" -E -i "database_setup.sql"

echo.
echo Database setup tamamlandı!
pause 