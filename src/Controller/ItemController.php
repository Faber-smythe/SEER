<?php

namespace App\Controller;

use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Twig\Environment;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\HttpFoundation\Request;
use App\Repository\WorldRepository;
use App\Repository\GameRepository;
use App\Repository\ItemTextRepository;
use App\Repository\ItemImageRepository;
use App\Entity\User;
use App\Entity\ItemText;
use App\Entity\ItemImage;
use App\Form\ItemTextType;
use App\Form\ItemImageType;
use Cocur\Slugify\Slugify;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ItemController extends BaseController
{
  public function __construct(GameRepository $gamerepository, WorldRepository $worldrepository, ItemTextRepository $itemtextrepository, ItemImageRepository $itemimagerepository, ObjectManager $em)
  {
    $this->gamerepository = $gamerepository;
    $this->worldrepository = $worldrepository;
    $this->itemtextrepository = $itemtextrepository;
    $this->itemimagerepository = $itemimagerepository;
    $this->manager = $em;

  }

  // -----------------------
  // ITEM METHODS
  // -----------------------
  // These methods are requests sent from api.js (lives in /assets/)
  // They are acting on items in Database.
  //
  // - [pin_this_item] just find the requested item and switches the 'pinned' boolean column
  // - [new_item] creates a new item from the data passed through request and saves it in DB
  // - [edit_item] updates the target item in the DB with the data passed through request
  // - [delete_item] removes the target item in the DB with the ID passed through request
  //

  /**
  * @Route("worlds/{world}/{game}/pin/{type}/{id}", options={"expose" = true}, requirements={
  * "type"="text|image"} )
  * @Method("POST")
  */
  public function pin_this_item($world, $game, $id, $type, Request $request): Response
  {
    // user needs to be logged in
    $this->denyAccessUnlessGranted('IS_AUTHENTICATED_REMEMBERED');
    // initialize
    $item_to_pin;

    //TODO if item is type == image
    if($type == 'text'){
      $item_to_pin = $this->itemtextrepository->findItemTextById(
        $this->userId(),
        $this->worldId($world),
        $this->gameId($world, $game),
        $id
      );
    }
    // toggle (pin if unpinned, unpin if pinned)
    if($item_to_pin->getPinned()){
      $item_to_pin->setPinned(false);
    }else{
      $item_to_pin->setPinned(true);
    }
    // save it
    $this->manager->persist($item_to_pin);
    $this->manager->flush();

    // sending a response to the Ajax call for confirmation
    return $this->json(['action' => $item_to_pin]);
  }



  /**
  * @Route("worlds/{world}/{game}/new-item/{type?text}", requirements={"type"="text|image"}, options={"expose" = true})
  * @Method("POST")
  */
  public function new_item($world, $game, $type, Request $request ): Response
  {
    // user needs to be logged in
    $this->denyAccessUnlessGranted('IS_AUTHENTICATED_REMEMBERED');
    // receives the ajax request
    $data = json_decode($request->getContent(), true);
    // debug precaution
    if ($data === null) {
        throw new BadRequestHttpException('Invalid JSON');
    }
    // initialize
    $newText = null;
    //TODO if item is type == image
    if($type == 'text'){
      $newText = new ItemText;
      $newText->setUser($data['user'])
        ->setWorld($data['world'])
        ->setGame($data['game'])
        ->setName($data['name'])
        ->setContent($data['content'])
        ->setPinned($data['pinned'])
        ->setSlug($data['slug'])
      ;
      // save it
      $this->manager->persist($newText);
      // increment the number of items for this game
      $currentGame = $this->gamerepository->findGameBySlug(
        $this->userId(),
        $this->worldId($world),
        $game
      );
      $currentGame->setItems(($currentGame->getItems())+1);
      //save it
      $this->manager->persist($currentGame);
      $this->manager->flush();
    }
    // sending a response to the Ajax call for confirmation
    // /!\ SIGHTAPP needs the incremented ID from this response !
    return $this->json(['action' => $newText]);
  }


  /**
  * @Route("worlds/{world}/{game}/edit-item/{type?text}/{id}", requirements={"type"="text|image"}, options={"expose" = true})
  * @Method("POST")
  */
  public function edit_item($world, $game, $type, $id, Request $request): Response
  {
    // user needs to be logged i
    $this->denyAccessUnlessGranted('IS_AUTHENTICATED_REMEMBERED');
    // receives the ajax request
    $data = json_decode($request->getContent(), true);
    // debug precaution
    if ($data === null) {
        throw new BadRequestHttpException('Invalid JSON');
    }
    // initialize
    $item_to_update = null ;
    //TODO if item is type == image
    if($type == 'text'){
      // find it
      $item_to_update = $this->itemtextrepository->findItemTextById(
        $this->userId(),
        $this->worldId($world),
        $this->gameId($world, $game),
        $id
      );
      // update it
      $item_to_update->setName($data['name'])
        ->setContent($data['content'])
        ->setSlug($data['slug'])
      ;
      // save it
      $em = $this->getDoctrine()->getManager();
      $em->persist($item_to_update);
      $em->flush();
    }

    // sending a response to the Ajax call for confirmation
    return $this->json(['updated' => $item_to_update]);
  }

  /**
  * @Route("worlds/{world}/{game}/delete-item/{type?text}/{id}", name="item.delete", requirements={
  * "type"="text|image"} )
  * @Method("DELETE")
  */
  public function delete_item($world, $game, $id, $type, Request $request): Response
  {
    // user needs to be logged in
    $this->denyAccessUnlessGranted('IS_AUTHENTICATED_REMEMBERED');

    //initialize
    $item_to_delete = null;
    //TODO if item is type == image
    if($type == 'text'){
      // find it
      $item_to_delete = $this->itemtextrepository->findItemTextById(
        $this->userId(),
        $this->worldId($world),
        $this->gameId($world, $game),
        $id
      );
    }
    // remove it
    $this->manager->remove($item_to_delete);
    // decrement the number of items for this game
    $currentGame = $this->gamerepository->findGameBySlug(
      $this->userId(),
      $this->worldId($world),
      $game
    );
    $currentGame->setItems(($currentGame->getItems())-1);
    // save it
    $this->manager->persist($currentGame);
    // flush
    $this->manager->flush();

    // sending a response to the Ajax call for confirmation
    // SIGHTAPP waits for this confirmation to play the delete_sound
    return $this->json(['action' => 'item deleted']);
  }

}
?>
