<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Repository\WorldRepository ;
use App\Repository\GameRepository;

class BaseController extends AbstractController
{

  public function __construct(WorldRepository $worldrepository, GameRepository $gamerepository)
  {
    $this->worldrepository = $worldrepository;
    $this->gamerepository = $gamerepository;
  }

  // -----------------------
  // TOOL METHODS
  // -----------------------
  // Get easily the IDs of current user, world, and game (needed for repository methods)
  //

  public function userId(){
    return($this->getUser()->getId());
  }

  public function worldId($world){
    return(
      $this->worldrepository->findWorldBySlug(
        $this->userId(),
        $world
      )->getId()
    );
  }

  public function gameId($world, $game){
    return(
      $this->gamerepository->findGameBySlug(
        $this->userId(),
        $this->worldId($world),
        $game
      )->getId()
    );
  }

}
