.PHONY: deploy

deploy:
	git checkout pages
	cd example
	git pull --rebase
	git rebase main
	yarn build
	cd ../
	git add docs/\*
	git commit -m "deploy pages"
	git push --set-upstream origin pages
	git rm -rf docs/*
	git checkout main