echo "Commit name: "
read commit
git add .
git commit . -m "${commit} | @dream-25"
git push -f origin main
echo "Deploy Done"