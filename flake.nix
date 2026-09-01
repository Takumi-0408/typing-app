{
  description = "年収打 development shell";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { nixpkgs, ... }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAll = nixpkgs.lib.genAttrs systems;
    in {
      devShells = forAll (system:
        let pkgs = nixpkgs.legacyPackages.${system};
        in {
          default = pkgs.mkShell {
            packages = [ pkgs.just pkgs.git pkgs.wrangler ];
            shellHook = ''
              echo "年収打: just / vp / wrangler を使います。vp が無ければ https://vite.plus を入れてください。"
            '';
          };
        });
    };
}
