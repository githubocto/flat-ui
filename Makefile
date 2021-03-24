.PHONY: deploy

deploy:
	git checkout pages
	cd example
	yarn build
	git add docs/\*
	git commit -m "deploy pages"
	git push --set-upstream origin pages
	git checkout main
	git rm -rf docs/*